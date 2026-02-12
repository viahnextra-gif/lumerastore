import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, Megaphone, MoreHorizontal, Play, Pause, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  campaign_type: string;
  status: string;
  budget: number;
  budget_type: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-slate-100 text-slate-800',
};

const platformLabels: Record<string, string> = {
  meta: '📘 Meta Ads',
  google: '🔍 Google Ads',
  tiktok: '🎵 TikTok Ads',
  pinterest: '📌 Pinterest Ads',
  x: '𝕏 X Ads',
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '', platform: 'meta', campaign_type: 'awareness', budget: '', budget_type: 'daily',
    start_date: '', end_date: '', notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (c: Campaign) => {
    setEditing(c);
    setFormData({
      name: c.name, platform: c.platform, campaign_type: c.campaign_type,
      budget: c.budget.toString(), budget_type: c.budget_type,
      start_date: c.start_date?.slice(0, 10) || '', end_date: c.end_date?.slice(0, 10) || '',
      notes: c.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta campaña?')) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw error;
      setCampaigns(campaigns.filter((c) => c.id !== id));
      toast({ title: 'Campaña eliminada' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('campaigns').update({ status }).eq('id', id);
      if (error) throw error;
      setCampaigns(campaigns.map((c) => c.id === id ? { ...c, status } : c));
      toast({ title: 'Estado actualizado' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        name: formData.name,
        platform: formData.platform,
        campaign_type: formData.campaign_type,
        budget: parseFloat(formData.budget) || 0,
        budget_type: formData.budget_type,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
      };

      if (editing) {
        const { error } = await supabase.from('campaigns').update(data).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('campaigns').insert(data);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditing(null);
      setFormData({ name: '', platform: 'meta', campaign_type: 'awareness', budget: '', budget_type: 'daily', start_date: '', end_date: '', notes: '' });
      fetchCampaigns();
      toast({ title: editing ? 'Campaña actualizada' : 'Campaña creada' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const filtered = campaigns.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Campañas</h1>
          <p className="text-muted-foreground">Gestiona campañas de ads en múltiples plataformas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setFormData({ name: '', platform: 'meta', campaign_type: 'awareness', budget: '', budget_type: 'daily', start_date: '', end_date: '', notes: '' }); }}>
              <Plus className="h-4 w-4 mr-2" /> Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nueva'} Campaña</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Black Friday 2026" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(platformLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.campaign_type} onValueChange={(v) => setFormData({ ...formData, campaign_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Reconocimiento</SelectItem>
                      <SelectItem value="traffic">Tráfico</SelectItem>
                      <SelectItem value="conversion">Conversión</SelectItem>
                      <SelectItem value="engagement">Interacción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Presupuesto (USD)</Label><Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Tipo de presupuesto</Label>
                  <Select value={formData.budget_type} onValueChange={(v) => setFormData({ ...formData, budget_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="lifetime">Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Inicio</Label><Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>Fin</Label><Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Notas</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.name}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay campañas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{platformLabels[c.platform] || c.platform}</TableCell>
                    <TableCell>{formatPrice(c.budget)}<span className="text-xs text-muted-foreground ml-1">/{c.budget_type === 'daily' ? 'día' : 'total'}</span></TableCell>
                    <TableCell><Badge className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' }) : '—'}
                      {c.end_date ? ` — ${new Date(c.end_date).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })}` : ''}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(c)}><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                          {c.status === 'draft' && <DropdownMenuItem onClick={() => handleStatusChange(c.id, 'active')}><Play className="h-4 w-4 mr-2" /> Activar</DropdownMenuItem>}
                          {c.status === 'active' && <DropdownMenuItem onClick={() => handleStatusChange(c.id, 'paused')}><Pause className="h-4 w-4 mr-2" /> Pausar</DropdownMenuItem>}
                          {c.status === 'paused' && <DropdownMenuItem onClick={() => handleStatusChange(c.id, 'active')}><Play className="h-4 w-4 mr-2" /> Reactivar</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => handleStatusChange(c.id, 'archived')}><Archive className="h-4 w-4 mr-2" /> Archivar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
