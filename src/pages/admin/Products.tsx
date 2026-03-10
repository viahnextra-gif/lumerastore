import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Loader2, Package, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import ImageUpload from '@/components/admin/ImageUpload';
import VideoUpload from '@/components/admin/VideoUpload';

interface Product {
  id: string; name: string; slug: string; description: string | null; price: number;
  wholesale_price: number | null; stock: number; is_active: boolean; is_featured: boolean;
  images: string[]; sizes: string[]; colors: string[]; category_id: string | null; video_url: string | null;
}

interface Category { id: string; name: string; slug: string; }

interface ProductFormData {
  name: string; slug: string; description: string; price: string; wholesale_price: string;
  min_wholesale_qty: string; stock: string; is_active: boolean; is_featured: boolean;
  sizes: string; colors: string; images: string[]; category_id: string; video_url: string | null;
}

const initialFormData: ProductFormData = {
  name: '', slug: '', description: '', price: '', wholesale_price: '', min_wholesale_qty: '10',
  stock: '0', is_active: true, is_featured: false, sizes: 'P, M, G, GG', colors: '', images: [], category_id: '', video_url: null,
};

export default function Products() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) { console.error('Error fetching products:', error); } finally { setIsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('id, name, slug').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) { console.error('Error fetching categories:', error); }
  };

  

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, slug: product.slug, description: product.description || '', price: product.price.toString(),
      wholesale_price: product.wholesale_price?.toString() || '', min_wholesale_qty: '10', stock: product.stock.toString(),
      is_active: product.is_active, is_featured: product.is_featured, sizes: product.sizes.join(', '),
      colors: product.colors.join(', '), images: product.images || [], category_id: product.category_id || '', video_url: product.video_url || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast({ title: t('admin.productDeleted') });
    } catch (error) {
      toast({ title: 'Error', description: t('admin.couldNotDelete'), variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const productData = {
        name: formData.name, slug: formData.slug || generateSlug(formData.name), description: formData.description || null,
        price: parseFloat(formData.price), wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        min_wholesale_qty: parseInt(formData.min_wholesale_qty), stock: parseInt(formData.stock), is_active: formData.is_active,
        is_featured: formData.is_featured, sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map((c) => c.trim()).filter(Boolean), images: formData.images,
        category_id: formData.category_id || null, video_url: formData.video_url || null,
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: t('admin.productUpdated') });
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast({ title: t('admin.productCreated') });
      }

      setIsDialogOpen(false); setEditingProduct(null); setFormData(initialFormData); fetchProducts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || t('admin.couldNotSave'), variant: 'destructive' });
    } finally { setIsSaving(false); }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.productsTitle')}</h1>
          <p className="text-muted-foreground">{t('admin.productsSubtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProduct(null); setFormData(initialFormData); }}>
              <Plus className="h-4 w-4 mr-2" /> {t('admin.newProduct')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? t('admin.editProduct') : t('admin.newProduct')}</DialogTitle>
              <DialogDescription>{t('admin.productData')}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">{t('admin.info')}</TabsTrigger>
                <TabsTrigger value="images">{t('admin.images')}</TabsTrigger>
                <TabsTrigger value="video">{t('admin.video')}</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('admin.productName')}</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="Vestido Floral" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="vestido-floral" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.category')}</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger><SelectValue placeholder={t('admin.selectCategory')} /></SelectTrigger>
                    <SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.description')}</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('admin.descriptionPlaceholder')} rows={3} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('admin.pricePYG')}</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="150000" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.wholesalePrice')}</Label>
                    <Input type="number" value={formData.wholesale_price} onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })} placeholder="120000" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.stock')}</Label>
                    <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="50" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('admin.sizes')}</Label>
                    <Input value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} placeholder="P, M, G, GG" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.colors')}</Label>
                    <Input value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} placeholder="Rosa, Preto, Branco" />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                    <Label>{t('admin.active')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                    <Label>{t('admin.featured')}</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="mt-4">
                <ImageUpload images={formData.images} onImagesChange={(images) => setFormData({ ...formData, images })} maxImages={5} />
              </TabsContent>

              <TabsContent value="video" className="mt-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{t('admin.productVideo')}</p>
                  <p className="text-xs text-muted-foreground mb-3">{t('admin.videoDesc')}</p>
                  <VideoUpload videoUrl={formData.video_url} onVideoChange={(url) => setFormData({ ...formData, video_url: url })} />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('admin.cancel')}</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.price}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct ? t('admin.save') : t('admin.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('admin.searchProducts')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('admin.noProducts')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.productsTitle')}</TableHead>
                  <TableHead>{t('mk.price')}</TableHead>
                  <TableHead>{t('admin.stock')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.wholesale_price && <p className="text-sm text-muted-foreground">{t('admin.wholesale')}: {formatPrice(product.wholesale_price)}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>{product.stock} {t('admin.units')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.is_active ? <Badge className="bg-green-100 text-green-800">{t('admin.active')}</Badge> : <Badge variant="secondary">{t('admin.inactive')}</Badge>}
                        {product.is_featured && <Badge className="bg-purple-100 text-purple-800">{t('admin.featured')}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}><Edit className="h-4 w-4 mr-2" />{t('admin.edit')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />{t('admin.delete')}</DropdownMenuItem>
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
