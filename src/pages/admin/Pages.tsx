import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, FileText, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
}

export default function Pages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleEdit = (page: Page) => {
    setEditing(page);
    setFormData({
      title: page.title, slug: page.slug, content: page.content || '',
      meta_title: page.meta_title || '', meta_description: page.meta_description || '',
      is_published: page.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta página?')) return;
    try {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;
      setPages(pages.filter((p) => p.id !== id));
      toast({ title: 'Página eliminada' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content || null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        is_published: formData.is_published,
      };

      if (editing) {
        const { error } = await supabase.from('pages').update(data).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pages').insert(data);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditing(null);
      setFormData({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: false });
      fetchPages();
      toast({ title: editing ? 'Página actualizada' : 'Página creada' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Páginas</h1>
          <p className="text-muted-foreground">Crea y gestiona páginas personalizadas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setFormData({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: false }); }}>
              <Plus className="h-4 w-4 mr-2" /> Nueva Página
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nueva'} Página</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })} placeholder="Sobre Nosotros" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={10} placeholder="Contenido de la página (HTML o texto)..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Título (SEO)</Label>
                  <Input value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} placeholder="Título para buscadores" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Descripción (SEO)</Label>
                  <Input value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} placeholder="Descripción para buscadores" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                <Label>Publicada</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.title}>
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
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay páginas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Página</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={page.is_published ? 'default' : 'secondary'}>
                        {page.is_published ? 'Publicada' : 'Borrador'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(page.created_at).toLocaleDateString('es-PY')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(page)}><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(page.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
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
