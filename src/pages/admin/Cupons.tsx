import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Cupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: 10,
    min_purchase: 0,
    usage_limit: '',
    valid_until: '',
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[Cupons] load error:', error);
      toast({ title: 'Erro ao carregar cupons', description: error.message, variant: 'destructive' });
    }
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.code.trim() || form.discount_value <= 0) {
      toast({ title: 'Dados inválidos', description: 'Código e valor são obrigatórios.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload: any = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_purchase: form.min_purchase || null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
    };
    const { error } = await (supabase as any).from('coupons').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao criar cupom', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Cupom criado', description: payload.code });
    setForm({ ...form, code: '', discount_value: 10, min_purchase: 0, usage_limit: '', valid_until: '' });
    load();
  };

  const toggleActive = async (c: Coupon) => {
    const { error } = await (supabase as any).from('coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este cupom?')) return;
    const { error } = await (supabase as any).from('coupons').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Cupons de Desconto</h1>
        <p className="text-muted-foreground">Crie e gerencie cupons promocionais para sua loja.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Novo Cupom</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BELEZA10" maxLength={32} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentual (%)</SelectItem>
                <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor do desconto</Label>
            <Input type="number" min={0} step={0.01} value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Compra mínima (R$)</Label>
            <Input type="number" min={0} step={0.01} value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Limite de usos</Label>
            <Input type="number" min={1} value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Ilimitado" />
          </div>
          <div className="space-y-2">
            <Label>Válido até</Label>
            <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <Label>Ativo</Label>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button onClick={create} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Criar cupom
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cupons existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : coupons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum cupom cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold">{c.code}</TableCell>
                    <TableCell>
                      {c.discount_type === 'percent' ? `${c.discount_value}%` : `R$ ${Number(c.discount_value).toFixed(2)}`}
                    </TableCell>
                    <TableCell>{c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</TableCell>
                    <TableCell>{c.valid_until ? new Date(c.valid_until).toLocaleDateString('pt-BR') : '—'}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive(c)}>
                        <Badge variant={c.is_active ? 'default' : 'secondary'}>
                          {c.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)} aria-label="Excluir cupom">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
