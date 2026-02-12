import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, Key, MoreHorizontal, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiCredential {
  id: string;
  platform: string;
  credential_type: string;
  credential_name: string;
  credential_value: string;
  is_active: boolean;
  created_at: string;
}

const platforms = [
  { value: 'meta', label: '📘 Meta (Facebook/Instagram)' },
  { value: 'google', label: '🔍 Google' },
  { value: 'tiktok', label: '🎵 TikTok' },
  { value: 'pinterest', label: '📌 Pinterest' },
  { value: 'x', label: '𝕏 X (Twitter)' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'stripe', label: '💳 Stripe' },
  { value: 'other', label: '🔧 Otro' },
];

const credentialTypes = [
  { value: 'api_key', label: 'API Key' },
  { value: 'token', label: 'Access Token' },
  { value: 'secret', label: 'Secret Key' },
  { value: 'app_id', label: 'App ID' },
  { value: 'webhook', label: 'Webhook URL' },
  { value: 'refresh_token', label: 'Refresh Token' },
];

export default function ApiCredentials() {
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCredential | null>(null);
  const [formData, setFormData] = useState({
    platform: 'meta', credential_type: 'api_key', credential_name: '', credential_value: '', is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => { fetchCredentials(); }, []);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase.from('api_credentials').select('*').order('platform, credential_name');
      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cred: ApiCredential) => {
    setEditing(cred);
    setFormData({
      platform: cred.platform, credential_type: cred.credential_type,
      credential_name: cred.credential_name, credential_value: cred.credential_value,
      is_active: cred.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta credencial?')) return;
    try {
      const { error } = await supabase.from('api_credentials').delete().eq('id', id);
      if (error) throw error;
      setCredentials(credentials.filter((c) => c.id !== id));
      toast({ title: 'Credencial eliminada' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        platform: formData.platform,
        credential_type: formData.credential_type,
        credential_name: formData.credential_name,
        credential_value: formData.credential_value,
        is_active: formData.is_active,
      };

      if (editing) {
        const { error } = await supabase.from('api_credentials').update(data).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('api_credentials').insert(data);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditing(null);
      setFormData({ platform: 'meta', credential_type: 'api_key', credential_name: '', credential_value: '', is_active: true });
      fetchCredentials();
      toast({ title: editing ? 'Credencial actualizada' : 'Credencial creada' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const maskValue = (val: string) => val.slice(0, 6) + '•'.repeat(Math.max(0, val.length - 10)) + val.slice(-4);
  const getPlatformLabel = (val: string) => platforms.find((p) => p.value === val)?.label || val;
  const getTypeLabel = (val: string) => credentialTypes.find((t) => t.value === val)?.label || val;

  const filtered = credentials.filter((c) =>
    c.credential_name.toLowerCase().includes(search.toLowerCase()) ||
    c.platform.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">API & Credenciales</h1>
          <p className="text-muted-foreground">Gestiona claves de API, tokens y webhooks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setFormData({ platform: 'meta', credential_type: 'api_key', credential_name: '', credential_value: '', is_active: true }); }}>
              <Plus className="h-4 w-4 mr-2" /> Nueva Credencial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nueva'} Credencial</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.credential_type} onValueChange={(v) => setFormData({ ...formData, credential_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {credentialTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={formData.credential_name} onChange={(e) => setFormData({ ...formData, credential_name: e.target.value })} placeholder="Meta Ads API Key" />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="password" value={formData.credential_value} onChange={(e) => setFormData({ ...formData, credential_value: e.target.value })} placeholder="sk_live_xxxxx..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>Activa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.credential_name || !formData.credential_value}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Seguridad</AlertTitle>
        <AlertDescription>
          Las credenciales están protegidas y solo visibles para administradores. Nunca comparta estas claves públicamente.
        </AlertDescription>
      </Alert>

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
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay credenciales configuradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cred) => (
                  <TableRow key={cred.id}>
                    <TableCell>{getPlatformLabel(cred.platform)}</TableCell>
                    <TableCell className="font-medium">{cred.credential_name}</TableCell>
                    <TableCell><Badge variant="outline">{getTypeLabel(cred.credential_type)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {showValues[cred.id] ? cred.credential_value : maskValue(cred.credential_value)}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowValues({ ...showValues, [cred.id]: !showValues[cred.id] })}>
                          {showValues[cred.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cred.is_active ? 'default' : 'secondary'}>
                        {cred.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(cred)}><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(cred.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
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
