import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, FileText, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Page { id: string; title: string; slug: string; content: string | null; meta_title: string | null; meta_description: string | null; is_published: boolean; created_at: string; }

const quillModules = { toolbar: [[{ header: [1, 2, 3, 4, false] }], ['bold', 'italic', 'underline', 'strike'], [{ color: [] }, { background: [] }], [{ list: 'ordered' }, { list: 'bullet' }], [{ align: [] }], ['blockquote', 'code-block'], ['link', 'image', 'video'], ['clean']] };

export default function Pages() {
  const { t, language } = useLanguage();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: false });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => { try { const { data, error } = await supabase.from('pages').select('*').order('created_at', { ascending: false }); if (error) throw error; setPages(data || []); } catch (error) { console.error('Error:', error); } finally { setIsLoading(false); } };

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleEdit = (page: Page) => { setEditing(page); setFormData({ title: page.title, slug: page.slug, content: page.content || '', meta_title: page.meta_title || '', meta_description: page.meta_description || '', is_published: page.is_published }); setIsDialogOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDeletePage'))) return;
    try { const { error } = await supabase.from('pages').delete().eq('id', id); if (error) throw error; setPages(pages.filter((p) => p.id !== id)); toast({ title: t('admin.pageDeleted') }); } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = { title: formData.title, slug: formData.slug || generateSlug(formData.title), content: formData.content || null, meta_title: formData.meta_title || null, meta_description: formData.meta_description || null, is_published: formData.is_published };
      if (editing) { const { error } = await supabase.from('pages').update(data).eq('id', editing.id); if (error) throw error; }
      else { const { error } = await supabase.from('pages').insert(data); if (error) throw error; }
      setIsDialogOpen(false); setEditing(null); setFormData({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: false }); fetchPages();
      toast({ title: editing ? t('admin.pageUpdated') : t('admin.pageCreated') });
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); } finally { setIsSaving(false); }
  };

  const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-PY' : 'en-US';
  const filtered = pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.pagesTitle')}</h1>
          <p className="text-muted-foreground">{t('admin.pagesSubtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setFormData({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: false }); }}>
              <Plus className="h-4 w-4 mr-2" /> {t('admin.newPage')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? t('admin.editPage') : t('admin.newPage')}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t('admin.pageTitle')}</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })} /></div>
                <div className="space-y-2"><Label>{t('admin.pageSlug')}</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>{t('admin.pageContent')}</Label>
                <div className="min-h-[300px] border rounded-md"><ReactQuill theme="snow" value={formData.content} onChange={(value) => setFormData({ ...formData, content: value })} modules={quillModules} style={{ height: '250px' }} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="space-y-2"><Label>{t('admin.metaTitle')}</Label><Input value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} placeholder={t('admin.metaTitlePlaceholder')} /></div>
                <div className="space-y-2"><Label>{t('admin.metaDesc')}</Label><Input value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} placeholder={t('admin.metaDescPlaceholder')} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} /><Label>{t('admin.publishedLabel')}</Label></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('admin.cancel')}</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.title}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t('admin.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('admin.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t('admin.noPages')}</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('admin.pageColumn')}</TableHead>
                <TableHead>{t('admin.slugColumn')}</TableHead>
                <TableHead>{t('admin.statusPageColumn')}</TableHead>
                <TableHead>{t('admin.datePageColumn')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                    <TableCell><Badge variant={page.is_published ? 'default' : 'secondary'}>{page.is_published ? t('admin.publishedLabel') : t('admin.draftLabel')}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(page.created_at).toLocaleDateString(locale)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(page)}><Edit className="h-4 w-4 mr-2" /> {t('admin.edit')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(page.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> {t('admin.delete')}</DropdownMenuItem>
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
