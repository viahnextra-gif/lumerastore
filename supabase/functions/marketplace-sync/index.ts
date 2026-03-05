import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { operation, tenant_id, marketplace, product_ids, date_range, log_id } = await req.json();

    // Retry operation
    if (operation === "retry" && log_id) {
      const { data: log } = await supabase
        .from("marketplace_sync_logs")
        .select("*")
        .eq("id", log_id)
        .single();

      if (!log) {
        return new Response(JSON.stringify({ error: "Log not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase
        .from("marketplace_sync_logs")
        .update({ status: "pending", retried_at: new Date().toISOString() })
        .eq("id", log_id);

      return new Response(JSON.stringify({ success: true, message: "Retry queued" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the sync operation
    const { data: syncLog } = await supabase
      .from("marketplace_sync_logs")
      .insert({
        tenant_id,
        marketplace,
        operation_type: operation,
        status: "pending",
        payload_snapshot: { product_ids, date_range },
      })
      .select()
      .single();

    // Placeholder: actual marketplace API calls would go here
    // For now, simulate success
    const result = { synced: product_ids?.length || 0, errors: 0 };

    await supabase
      .from("marketplace_sync_logs")
      .update({ status: "success" })
      .eq("id", syncLog?.id);

    return new Response(JSON.stringify({ success: true, result, log_id: syncLog?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Marketplace sync error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
