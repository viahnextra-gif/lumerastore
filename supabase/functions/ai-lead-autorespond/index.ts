import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { leadId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) throw new Error("Lead not found");

    // Fetch products for context
    const { data: products } = await supabase
      .from("products")
      .select("name, price, description")
      .eq("is_active", true)
      .limit(10);

    const productList = products?.map(p => `- ${p.name}: R$ ${p.price}`).join("\n") || "Sem produtos disponíveis";

    const prompt = `Você é uma assistente de vendas da **Lumera Store** (loja de cosméticos no Brasil).

REGRAS DE MARCA (OBRIGATÓRIAS):
- SEMPRE use o nome completo "Lumera Store" ao mencionar a loja na resposta.
- NUNCA use os nomes antigos "Wakai", "Meca Store" ou "mecastore".

Um lead "${lead.status}" te contatou:
- Nome: ${lead.name || "Desconhecido"}
- Email: ${lead.email || "Não fornecido"}
- Telefone: ${lead.phone || "Não fornecido"}
- Mensagem: ${lead.message || "Sem mensagem"}
- Score: ${lead.score}/100
- Origem: ${lead.source}

PRODUTOS DISPONÍVEIS:
${productList}

Gere uma resposta personalizada e persuasiva para este lead, assinando como "Equipe Lumera Store". Se for "hot", ofereça desconto ou frete grátis. Se for "warm", sugira produtos. Se for "cold", convide para conhecer a Lumera Store.
Inclua uma sugestão de ação para a equipe de vendas.
Responda SEMPRE em português brasileiro.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "generate_response",
            description: "Generate auto-response and action suggestion for a lead",
            parameters: {
              type: "object",
              properties: {
                response_message: { type: "string", description: "The message to send to the lead" },
                action_suggestion: { type: "string", description: "Action suggestion for the sales team" },
                recommended_channel: { type: "string", enum: ["email", "whatsapp", "phone"], description: "Best channel to contact" },
              },
              required: ["response_message", "action_suggestion", "recommended_channel"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_response" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) throw new Error("No AI response");

    const result = JSON.parse(toolCall.function.arguments);

    // Update lead notes with AI suggestion
    await supabase
      .from("leads")
      .update({
        notes: `🤖 IA: ${result.action_suggestion}\n📧 Canal: ${result.recommended_channel}\n\n💬 Respuesta sugerida:\n${result.response_message}`,
      })
      .eq("id", leadId);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
