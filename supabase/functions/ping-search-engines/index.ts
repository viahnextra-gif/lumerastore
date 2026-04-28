import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface PingResult {
  engine: string;
  url: string;
  status: number;
  ok: boolean;
  duration_ms: number;
  error?: string;
}

function log(level: "info" | "warn" | "error", message: string, meta: Record<string, unknown> = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    fn: "ping-search-engines",
    message,
    ...meta,
  };
  // Structured single-line JSON for easy filtering in edge function logs
  console.log(JSON.stringify(entry));
}

async function pingEngine(name: string, url: string): Promise<PingResult> {
  const start = Date.now();
  try {
    const r = await fetch(url, { method: "GET" });
    // Consume body to avoid resource leaks
    await r.text().catch(() => "");
    const result: PingResult = {
      engine: name,
      url,
      status: r.status,
      ok: r.ok,
      duration_ms: Date.now() - start,
    };
    log(r.ok ? "info" : "warn", "ping completed", result);
    return result;
  } catch (e) {
    const result: PingResult = {
      engine: name,
      url,
      status: 0,
      ok: false,
      duration_ms: Date.now() - start,
      error: e instanceof Error ? e.message : String(e),
    };
    log("error", "ping failed", result);
    return result;
  }
}

/**
 * Resolves the sitemap URL using (in order):
 * 1. ?sitemap= query param (only when caller is authenticated)
 * 2. SITEMAP_URL env var
 * 3. PUBLIC_SITE_URL env var + "/sitemap.xml"
 */
function resolveSitemap(req: Request, isAuthenticated: boolean): string | null {
  if (isAuthenticated) {
    const q = new URL(req.url).searchParams.get("sitemap");
    if (q) return q;
  }
  const envUrl = Deno.env.get("SITEMAP_URL");
  if (envUrl) return envUrl;
  const site = Deno.env.get("PUBLIC_SITE_URL");
  if (site) return `${site.replace(/\/$/, "")}/sitemap.xml`;
  return null;
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceKey || !anonKey) {
    log("error", "missing supabase env", { requestId });
    return new Response(
      JSON.stringify({ error: "Server is missing required environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ---- Authentication ----
  // Accepts EITHER:
  //  - A valid user JWT (admin only), used for manual triggers from the admin UI
  //  - The service role key (used by the pg_cron scheduled job)
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  let isAuthenticated = false;
  let isServiceRole = false;
  let userId: string | null = null;

  if (token && token === serviceKey) {
    isAuthenticated = true;
    isServiceRole = true;
  } else if (token) {
    try {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) {
        log("warn", "invalid user token", { requestId, error: userErr?.message });
      } else {
        userId = userData.user.id;
        // Check admin role via security definer function semantics (user_roles)
        const adminClient = createClient(supabaseUrl, serviceKey);
        const { data: roleRow } = await adminClient
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (roleRow) {
          isAuthenticated = true;
        } else {
          log("warn", "user is not admin", { requestId, userId });
        }
      }
    } catch (e) {
      log("error", "auth verification failed", {
        requestId,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const sitemapUrl = resolveSitemap(req, isAuthenticated);
  if (!sitemapUrl) {
    log("error", "no sitemap configured", { requestId });
    return new Response(
      JSON.stringify({
        error:
          "No sitemap URL configured. Set SITEMAP_URL or PUBLIC_SITE_URL env var, or pass ?sitemap= as admin.",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const trigger = isServiceRole ? "cron" : "manual";
  log("info", "ping started", { requestId, trigger, userId, sitemap: sitemapUrl });

  const startedAt = Date.now();
  const encoded = encodeURIComponent(sitemapUrl);
  const targets = [
    { name: "google", url: `https://www.google.com/ping?sitemap=${encoded}` },
    { name: "bing", url: `https://www.bing.com/ping?sitemap=${encoded}` },
  ];

  const results = await Promise.all(targets.map((t) => pingEngine(t.name, t.url)));
  const allOk = results.every((r) => r.ok);
  const totalMs = Date.now() - startedAt;

  log(allOk ? "info" : "warn", "ping finished", {
    requestId,
    trigger,
    sitemap: sitemapUrl,
    total_ms: totalMs,
    ok: allOk,
    summary: results.map((r) => ({ engine: r.engine, status: r.status, ok: r.ok })),
  });

  // Best-effort audit log to settings table
  const supabase = createClient(supabaseUrl, serviceKey);
  try {
    await supabase.from("settings").upsert(
      {
        key: "last_sitemap_ping",
        value: JSON.stringify({
          at: new Date().toISOString(),
          trigger,
          requestId,
          sitemap: sitemapUrl,
          total_ms: totalMs,
          ok: allOk,
          results,
        }),
        description: "Última notificação enviada para Google e Bing sobre o sitemap.xml",
        is_secret: false,
      },
      { onConflict: "key" },
    );
  } catch (e) {
    log("warn", "could not persist last_sitemap_ping", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // Emit a SEO alert when ping fails so the admin gets notified
  if (!allOk) {
    try {
      const failed = results.filter((r) => !r.ok);
      await supabase.from("seo_alerts").insert({
        alert_type: "sitemap_ping_failed",
        severity: failed.length === results.length ? "critical" : "warning",
        message: `Falha ao notificar ${failed.map((f) => f.engine).join(", ")} sobre o sitemap`,
        details: { trigger, sitemap: sitemapUrl, requestId, results },
      });
    } catch (e) {
      log("warn", "could not insert seo_alert", {
        requestId,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return new Response(
    JSON.stringify({ requestId, trigger, sitemap: sitemapUrl, ok: allOk, total_ms: totalMs, results }),
    {
      status: allOk ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
