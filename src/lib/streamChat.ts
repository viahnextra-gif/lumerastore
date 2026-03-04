const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`;

export async function streamChat({
  message,
  sessionId,
  userId,
  onDelta,
  onDone,
}: {
  message: string;
  sessionId: string;
  userId?: string;
  onDelta: (text: string) => void;
  onDone: (fullText: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ message, sessionId, userId }),
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) throw new Error("rate_limit");
    if (resp.status === 402) throw new Error("payment_required");
    throw new Error("stream_failed");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let fullText = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          fullText += content;
          onDelta(content);
        }
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          fullText += content;
          onDelta(content);
        }
      } catch { /* ignore */ }
    }
  }

  onDone(fullText);
}

/**
 * Parse the full AI response to extract product IDs and lead info,
 * returning cleaned text.
 */
export function parseAIResponse(text: string) {
  let cleanText = text;
  let productIds: string[] = [];
  let leadInfo: { name?: string; email?: string; phone?: string; score?: number; message?: string } | null = null;

  const productMatch = cleanText.match(/\[PRODUCTS:\s*([^\]]+)\]/);
  if (productMatch) {
    productIds = productMatch[1].split(",").map((id) => id.trim());
    cleanText = cleanText.replace(/\[PRODUCTS:[^\]]+\]/, "").trim();
  }

  const leadMatch = cleanText.match(/\[LEAD:\s*([^\]]+)\]/);
  if (leadMatch) {
    const parts = leadMatch[1].split("|");
    cleanText = cleanText.replace(/\[LEAD:[^\]]+\]/, "").trim();
    if (parts.length >= 4) {
      leadInfo = {
        name: parts[0] !== "null" ? parts[0] : undefined,
        email: parts[1] !== "null" ? parts[1] : undefined,
        phone: parts[2] !== "null" ? parts[2] : undefined,
        score: parseInt(parts[3]) || 5,
        message: parts[4] || undefined,
      };
    }
  }

  return { cleanText, productIds, leadInfo };
}
