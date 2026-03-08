import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface MkMessage {
  id: string;
  marketplace: string;
  customer_name: string | null;
  order_id: string | null;
  subject: string;
  content: string;
  reply_content: string | null;
  status: string;
  ai_suggestion: string | null;
  created_at: string;
}

export default function MarketplaceMessages() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState<MkMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<MkMessage | null>(null);
  const [reply, setReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    let query = supabase.from('marketplace_messages').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('marketplace', filter);
    const { data } = await query;
    setMessages((data as MkMessage[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    loadMessages();

    const channel = supabase
      .channel('mk-messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_messages' }, () => loadMessages())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, filter]);

  const handleAiSuggest = async () => {
    if (!selectedMsg) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { messages: [{ role: 'user', content: `Sugira uma resposta profissional para esta mensagem de cliente do marketplace ${selectedMsg.marketplace}: "${selectedMsg.content}"` }] },
      });
      if (error) throw error;
      if (data?.reply) setReply(data.reply);
      else toast.info(t('mk.noSuggestion'));
    } catch {
      toast.error(t('mk.error'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedMsg) return;
    await supabase.from('marketplace_messages').update({
      reply_content: reply,
      status: 'replied',
      updated_at: new Date().toISOString(),
    }).eq('id', selectedMsg.id);
    toast.success(t('mk.replySent'));
    setReply('');
    setSelectedMsg(null);
    loadMessages();
  };

  const mkColor = (mk: string) => {
    const c: Record<string, string> = {
      mercadolivre: 'bg-yellow-100 text-yellow-800',
      shopee: 'bg-orange-100 text-orange-800',
      amazon: 'bg-blue-100 text-blue-800',
      magalu: 'bg-purple-100 text-purple-800',
    };
    return c[mk] || 'bg-muted text-muted-foreground';
  };

  const pending = messages.filter((m) => m.status === 'pending').length;
  const replied = messages.filter((m) => m.status === 'replied').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('mk.msgCenter')}</h1>
          <p className="text-sm text-muted-foreground">{t('mk.msgCenter.subtitle')}</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('mk.all')}</SelectItem>
            <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
            <SelectItem value="shopee">Shopee</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="magalu">Magalu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('mk.pending')}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-yellow-500">{pending}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('mk.replied')}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-500">{replied}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('mk.totalMsg')}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-blue-500">{messages.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('mk.noMessages')}</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="divide-y">
                {messages.map((msg) => (
                  <button key={msg.id} onClick={() => { setSelectedMsg(msg); setReply(msg.reply_content || ''); }} className="w-full p-4 text-left hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${mkColor(msg.marketplace)}`}>{msg.marketplace}</Badge>
                        <span className="font-medium text-sm">{msg.customer_name || t('mk.customer')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.status === 'pending' && <Badge variant="secondary" className="text-xs">{t('mk.pending')}</Badge>}
                        {msg.status === 'replied' && <Badge className="text-xs bg-green-100 text-green-800">{t('mk.replied')}</Badge>}
                        <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{msg.content}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />{selectedMsg?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMsg && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${mkColor(selectedMsg.marketplace)}`}>{selectedMsg.marketplace}</Badge>
                <span className="text-sm">{selectedMsg.customer_name}</span>
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm">{selectedMsg.content}</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('mk.reply')}</span>
                  <Button variant="outline" size="sm" onClick={handleAiSuggest} disabled={aiLoading}>
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    {t('mk.autoRespond')}
                  </Button>
                </div>
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} placeholder="Digite sua resposta..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMsg(null)}>Cancelar</Button>
            <Button onClick={handleSendReply} disabled={!reply.trim()}><Send className="h-3 w-3 mr-1" /> Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
