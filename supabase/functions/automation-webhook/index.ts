import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { event_type, payload, tenant_id } = await req.json();

    if (!event_type || !tenant_id) {
      return new Response(JSON.stringify({ error: "event_type and tenant_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find enabled automation flows matching this event
    const triggerMap: Record<string, string> = {
      "order.created": "trigger_new_order",
      "order.updated": "trigger_order_status",
      "message.received": "trigger_new_message",
      "stock.low": "trigger_stock_low",
      "lead.created": "trigger_new_lead",
      "review.received": "trigger_review",
      "sync.error": "trigger_sync_error",
    };

    const triggerId = triggerMap[event_type];
    if (!triggerId) {
      return new Response(JSON.stringify({ error: "Unknown event type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all enabled flows for this tenant
    const { data: flows } = await supabase
      .from("automation_flows")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("enabled", true);

    if (!flows || flows.length === 0) {
      return new Response(JSON.stringify({ triggered: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter flows that have a matching trigger node
    const matchingFlows = flows.filter((flow: any) => {
      const nodes = flow.nodes as any[];
      return nodes.some((n: any) => n.templateId === triggerId && n.enabled);
    });

    const results = [];

    for (const flow of matchingFlows) {
      // Create execution log
      const { data: execution } = await supabase
        .from("automation_executions")
        .insert({
          flow_id: flow.id,
          tenant_id,
          status: "running",
          trigger_event: event_type,
          trigger_payload: payload,
        })
        .select()
        .single();

      try {
        // If flow has a webhook URL, call it
        if (flow.webhook_url) {
          const webhookResponse = await fetch(flow.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: event_type,
              flow_id: flow.id,
              flow_name: flow.name,
              platform: flow.platform,
              payload,
              nodes: flow.nodes,
            }),
          });

          if (!webhookResponse.ok) {
            throw new Error(`Webhook returned ${webhookResponse.status}`);
          }
        }

        // Mark as success
        await supabase
          .from("automation_executions")
          .update({
            status: "success",
            completed_at: new Date().toISOString(),
            result: { webhook_called: !!flow.webhook_url },
          })
          .eq("id", execution?.id);

        // Update flow last_run_at
        await supabase
          .from("automation_flows")
          .update({ last_run_at: new Date().toISOString(), status: "active" })
          .eq("id", flow.id);

        results.push({ flow_id: flow.id, status: "success" });
      } catch (err) {
        await supabase
          .from("automation_executions")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message: err.message,
          })
          .eq("id", execution?.id);

        await supabase
          .from("automation_flows")
          .update({ status: "error" })
          .eq("id", flow.id);

        results.push({ flow_id: flow.id, status: "failed", error: err.message });
      }
    }

    return new Response(JSON.stringify({ triggered: matchingFlows.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Automation webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
