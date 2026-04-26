import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITEMAP_URL = "https://lojawakai.lovable.app/sitemap.xml";

interface PingResult {
  engine: string;
  url: string;
  status: number;
  ok: boolean;
  error?: string;
}

async function pingEngine(name: string, url: string): Promise<PingResult> {
  try {
    const r = await fetch(url, { method: "GET" });
    return { engine: name, url, status: r.status, ok: r.ok };
  } catch (e) {
    return {
      engine: name,
      url,
      status: 0,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sitemapUrl =
      new URL(req.url).searchParams.get("sitemap") ?? SITEMAP_URL;

    const encoded = encodeURIComponent(sitemapUrl);
    const targets = [
      { name: "google", url: `https://www.google.com/ping?sitemap=${encoded}` },
      { name: "bing", url: `https://www.bing.com/ping?sitemap=${encoded}` },
    ];

    const results = await Promise.all(targets.map((t) => pingEngine(t.name, t.url)));

    // Best-effort log to settings table for audit trail
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await supabase.from("settings").upsert(
        {
          key: "last_sitemap_ping",
          value: JSON.stringify({ at: new Date().toISOString(), sitemap: sitemapUrl, results }),
          description: "Última notificação enviada para Google e Bing sobre o sitemap.xml",
          is_secret: false,
        },
        { onConflict: "key" },
      );
    } catch (e) {
      console.warn("Could not persist last_sitemap_ping:", e);
    }

    return new Response(JSON.stringify({ sitemap: sitemapUrl, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ping-search-engines error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
