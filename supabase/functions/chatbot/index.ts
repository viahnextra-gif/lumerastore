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
          `- ${p.name}: ${p.price} PYG, Tallas: ${p.sizes?.join(", ")}, Colores: ${p.colors?.join(", ")}, ID: ${p.id}`
      )
      .join("\n");

    const systemPrompt = `Eres un asistente de ventas amigable y experto de Meca Store, una tienda de moda femenina en Paraguay.

PRODUCTOS DISPONIBLES:
${productContext}

INSTRUCCIONES:
1. Responde siempre en español, de forma amigable y profesional
2. Ayuda a los clientes a encontrar productos según sus preferencias (estilo, ocasión, talla, color)
3. Proporciona información sobre precios, tallas y colores disponibles
4. Si el cliente muestra interés genuino, pregunta por su nombre, email y teléfono para dar seguimiento
5. Envío gratis en compras mayores a 500,000 PYG
6. Mantén las respuestas concisas pero útiles
7. Si recomiendas productos, incluye sus IDs para mostrarlos

FORMATO DE RESPUESTA:
Si recomiendas productos, incluye al final:
[PRODUCTS: id1, id2, id3]

CUALIFICACIÓN DE LEADS:
- Si el cliente proporciona nombre, email o teléfono, extrae estos datos
- Si muestra alto interés (pregunta precios, disponibilidad, cómo comprar), es un lead "hot"
- Si solo explora, es un lead "warm"
[LEAD: nombre|email|telefono|score(1-10)|mensaje]`;

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
