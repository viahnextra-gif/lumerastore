import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, User, Store } from 'lucide-react';
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

interface MarketplaceMessage {
  id: string;
  marketplace: string;
  customer_name: string;
  order_id: string | null;
  subject: string;
  content: string;
  status: 'pending' | 'replied' | 'closed';
  ai_suggestion: string | null;
  created_at: string;
}

export default function MarketplaceMessages() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [selectedMsg, setSelectedMsg] = useState<MarketplaceMessage | null>(null);
  const [reply, setReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Mock messages since we don't have a messages table yet
  const [messages] = useState<MarketplaceMessage[]>([]);

  const handleAiSuggest = async () => {
    if (!selectedMsg) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lead-autorespond', {
        body: { leadId: selectedMsg.id },
      });
      if (error) throw error;
      if (data?.response_message) {
        setReply(data.response_message);
        toast.success(t('mk.autoRespond'));
      }
    } catch {
      toast.error(t('mk.error'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    toast.success('Resposta enviada!');
    setReply('');
    setSelectedMsg(null);
  };

  const marketplaceColor = (mk: string) => {
    const colors: Record<string, string> = {
      mercadolivre: 'bg-yellow-100 text-yellow-800',
      shopee: 'bg-orange-100 text-orange-800',
      amazon: 'bg-blue-100 text-blue-800',
      magalu: 'bg-purple-100 text-purple-800',
    };
    return colors[mk] || 'bg-muted text-muted-foreground';
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('mk.pending')}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-500">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('mk.postSale')}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-500">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('mk.autoRespond')}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-500">0</p></CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('mk.noMessages')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Conecte seus marketplaces para receber mensagens aqui
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="divide-y">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMsg(msg)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${marketplaceColor(msg.marketplace)}`}>
                          {msg.marketplace}
                        </Badge>
                        <span className="font-medium text-sm">{msg.customer_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{msg.content}</p>
                    {msg.status === 'pending' && (
                      <Badge variant="secondary" className="text-xs mt-2">{t('mk.pending')}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {selectedMsg?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedMsg && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${marketplaceColor(selectedMsg.marketplace)}`}>
                  {selectedMsg.marketplace}
                </Badge>
                <span className="text-sm">{selectedMsg.customer_name}</span>
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm">{selectedMsg.content}</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resposta</span>
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
            <Button onClick={handleSendReply} disabled={!reply.trim()}>
              <Send className="h-3 w-3 mr-1" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
