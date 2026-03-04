import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { streamChat, parseAIResponse } from '@/lib/streamChat';

interface ChatProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProduct[];
}

export default function InlineAIAssistant() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isActive, setIsActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    if (!isActive) setIsActive(true);

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = crypto.randomUUID();

    try {
      await supabase.from('chat_messages').insert({
        session_id: sessionId, role: 'user', content: userMessage.content, user_id: user?.id || null,
      });

      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      let fullText = '';

      await streamChat({
        message: userMessage.content,
        sessionId,
        userId: user?.id,
        onDelta: (chunk) => {
          fullText += chunk;
          const display = fullText.replace(/\[PRODUCTS:[^\]]*\]?/g, '').replace(/\[LEAD:[^\]]*\]?/g, '').trim();
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: display } : m))
          );
        },
        onDone: async (text) => {
          const { cleanText, productIds } = parseAIResponse(text);

          let products: ChatProduct[] = [];
          if (productIds.length > 0) {
            const { data } = await supabase.from('products').select('id, name, price, images').in('id', productIds);
            products = data?.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.images?.[0] || '' })) || [];
          }

          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: cleanText, products } : m))
          );

          await supabase.from('chat_messages').insert({
            session_id: sessionId, role: 'assistant', content: cleanText, user_id: user?.id || null,
          });
        },
      });
    } catch (error) {
      console.error('AI error:', error);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: t('ai.error') } : m))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 }).format(price);

  const suggestions = [t('ai.suggestions.1'), t('ai.suggestions.2'), t('ai.suggestions.3'), t('ai.suggestions.4')];

  return (
    <section className="py-16 bg-gradient-soft">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">{t('ai.title')}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t('ai.subtitle')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            {isActive && (
              <ScrollArea className="max-h-[400px] p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.products && msg.products.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.products.map((product) => (
                              <a key={product.id} href={`/producto/${product.id}`} className="flex gap-2 p-2 rounded-lg bg-background/50 hover:bg-background transition-colors">
                                <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                                  <p className="text-xs text-primary font-semibold">{formatPrice(product.price)}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.content === '' && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {!isActive && (
              <div className="p-4 pb-0">
                <p className="text-sm text-muted-foreground mb-3 text-center">{t('ai.welcome')}</p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSend(s)} className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-primary/10 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('ai.placeholder')} disabled={isLoading} className="flex-1" />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
