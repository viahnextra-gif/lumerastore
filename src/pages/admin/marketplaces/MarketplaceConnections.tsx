import { useState, useEffect } from 'react';
import { Store, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const marketplaces = [
  { value: 'mercadolivre', label: 'Mercado Livre', auth: 'oauth2' },
  { value: 'shopee', label: 'Shopee', auth: 'oauth2' },
  { value: 'amazon', label: 'Amazon Seller', auth: 'api_token' },
  { value: 'magalu', label: 'Magalu', auth: 'api_token' },
];

export default function MarketplaceConnections() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [connections, setConnections] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ marketplace: '', token: '' });

  const load = async () => {
    const { data } = await supabase.from('marketplace_connections').select('*').order('created_at', { ascending: false });
    setConnections(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleConnect = async () => {
    if (!form.marketplace || !user) return;
    const { error } = await supabase.from('marketplace_connections').insert({
      tenant_id: user.id, marketplace: form.marketplace, credentials: { token: form.token }, status: 'connected',
    });
    if (error) { toast.error(error.message); return; }
    toast.success(t('mk.connected') + '!');
    setOpen(false);
    setForm({ marketplace: '', token: '' });
    load();
  };

  const handleDisconnect = async (id: string) => {
    await supabase.from('marketplace_connections').delete().eq('id', id);
    toast.success(t('mk.disconnected'));
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('mk.connections')}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> {t('mk.connect')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('mk.connect')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('mk.marketplace')}</Label>
                <Select value={form.marketplace} onValueChange={(v) => setForm({ ...form, marketplace: v })}>
                  <SelectTrigger><SelectValue placeholder={t('mk.select')} /></SelectTrigger>
                  <SelectContent>
                    {marketplaces.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('mk.token')}</Label>
                <Input type="password" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder={t('mk.pasteToken')} />
              </div>
              <Button onClick={handleConnect} className="w-full">{t('mk.connect')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('mk.noConnections')}</p>
            </CardContent>
          </Card>
        ) : connections.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base capitalize">{c.marketplace}</CardTitle>
              {c.status === 'connected' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('mk.since')} {new Date(c.created_at).toLocaleDateString()}</span>
              <Button variant="ghost" size="sm" onClick={() => handleDisconnect(c.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
