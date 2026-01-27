import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total: number;
  shipping_city: string;
  items_count?: number;
}

async function getWhatsAppSettings(supabase: SupabaseClient) {
  const { data: settings, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["whatsapp_access_token", "whatsapp_phone_number_id", "whatsapp_admin_phone", "whatsapp_enabled"]);

  if (error) {
    console.error("Error fetching WhatsApp settings:", error);
    return null;
  }

  const settingsMap: Record<string, string | null> = {};
  settings?.forEach((s: { key: string; value: string | null }) => {
    settingsMap[s.key] = s.value;
  });

  return settingsMap;
}

async function sendWhatsAppMessage(
  accessToken: string,
  phoneNumberId: string,
  toPhone: string,
  order: OrderData
) {
  const formattedPhone = toPhone.replace(/\D/g, "");
  const phoneWithCountry = formattedPhone.startsWith("55") ? formattedPhone : `55${formattedPhone}`;

  const message = `🛍️ *Novo Pedido Recebido!*

📦 *Pedido:* ${order.order_number}
👤 *Cliente:* ${order.customer_name}
📧 *Email:* ${order.customer_email}
📱 *Telefone:* ${order.customer_phone || "Não informado"}
🏙️ *Cidade:* ${order.shipping_city}
💰 *Total:* R$ ${order.total.toFixed(2).replace(".", ",")}

Acesse o painel administrativo para mais detalhes.`;

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneWithCountry,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error("WhatsApp API error:", result);
    throw new Error(`WhatsApp API error: ${JSON.stringify(result)}`);
  }

  console.log("WhatsApp message sent successfully:", result);
  return result;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order } = await req.json() as { order: OrderData };

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing WhatsApp notification for order:", order.order_number);

    // Get WhatsApp settings from database
    const settings = await getWhatsAppSettings(supabase);

    if (!settings) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch WhatsApp settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if WhatsApp is enabled
    if (settings.whatsapp_enabled !== "true") {
      console.log("WhatsApp notifications are disabled");
      return new Response(
        JSON.stringify({ success: true, message: "WhatsApp notifications are disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required settings
    const accessToken = settings.whatsapp_access_token;
    const phoneNumberId = settings.whatsapp_phone_number_id;
    const adminPhone = settings.whatsapp_admin_phone;

    if (!accessToken || !phoneNumberId || !adminPhone) {
      console.error("Missing WhatsApp configuration");
      return new Response(
        JSON.stringify({ 
          error: "WhatsApp configuration incomplete",
          missing: {
            access_token: !accessToken,
            phone_number_id: !phoneNumberId,
            admin_phone: !adminPhone,
          }
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(accessToken, phoneNumberId, adminPhone, order);

    return new Response(
      JSON.stringify({ success: true, message_id: result.messages?.[0]?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Error in notify-whatsapp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
