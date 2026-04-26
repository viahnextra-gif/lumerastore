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
    const { message, sessionId, userId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get conversation history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    // Get products for context
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price, description, sizes, colors, images, is_active")
      .eq("is_active", true)
      .limit(20);

    const productContext = products
      ?.map(
        (p) =>
          `- ${p.name}: R$ ${p.price}, Variantes: ${p.sizes?.join(", ")}, Cores: ${p.colors?.join(", ")}, ID: ${p.id}`
      )
      .join("\n");

    const systemPrompt = `Você é uma assistente de vendas amigável e especialista da **Lumera Store**, uma loja online de cosméticos no Brasil.

REGRAS DE MARCA (OBRIGATÓRIAS):
- SEMPRE se refira à loja pelo nome completo "Lumera Store" — nunca abrevie como "Lumera" sozinho, e NUNCA use os nomes antigos "Wakai", "Meca Store" ou "mecastore".
- Se o cliente mencionar um nome antigo, esclareça gentilmente que a loja agora se chama Lumera Store.

PRODUTOS DISPONÍVEIS:
${productContext}

INSTRUÇÕES:
1. Responda SEMPRE em português brasileiro, de forma amigável e profissional
2. Ajude os clientes a encontrar produtos de cosméticos e beleza segundo suas preferências (tipo de pele, ocasião, marca, cor)
3. Forneça informações sobre preços (em Reais - R$), variantes e cores disponíveis
4. Se o cliente mostrar interesse genuíno, pergunte nome, email e telefone para dar seguimento
5. Frete grátis em compras acima de R$ 350
6. Mantenha as respostas concisas mas úteis
7. Se recomendar produtos, inclua seus IDs para exibí-los
8. Ao se apresentar ou encerrar, mencione "Lumera Store" pelo nome completo

FORMATO DE RESPOSTA:
Se recomendar produtos, inclua ao final:
[PRODUCTS: id1, id2, id3]

QUALIFICAÇÃO DE LEADS:
- Se o cliente fornecer nome, email ou telefone, extraia esses dados
- Se mostrar alto interesse (perguntar preços, disponibilidade, como comprar), é um lead "hot"
- Se apenas explorar, é um lead "warm"
[LEAD: nome|email|telefone|score(1-10)|mensagem]`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history?.map((m: any) => ({ role: m.role, content: m.content })) || []),
      { role: "user", content: message },
    ];

    // Call Lovable AI Gateway with streaming
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    // Stream the response back
    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({
        error: "Lo siento, hubo un problema. ¿Puedo ayudarte en algo más?",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
