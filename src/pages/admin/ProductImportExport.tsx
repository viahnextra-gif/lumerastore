import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Upload, FileText, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ===== Formato Nuvemshop (cabeçalhos oficiais em pt-BR) =====
const NUVEMSHOP_HEADERS = [
  'Identificador de URL',
  'Nome',
  'Categorias',
  'Nome da variação 1',
  'Valor da variação 1',
  'Nome da variação 2',
  'Valor da variação 2',
  'Nome da variação 3',
  'Valor da variação 3',
  'Preço',
  'Preço promocional',
  'Peso (kg)',
  'Altura (cm)',
  'Largura (cm)',
  'Profundidade (cm)',
  'Estoque',
  'SKU',
  'Código de barras',
  'Mostrar na loja',
  'Frete grátis',
  'MPN (Cód. Exclusivo, Modelo ou Refer.)',
  'Marca',
  'Tags',
  'Título para SEO',
  'Descrição para SEO',
  'Descrição',
  'Imagem 1', 'Imagem 2', 'Imagem 3', 'Imagem 4', 'Imagem 5',
];

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  wholesale_price: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  sizes: string[];
  colors: string[];
  category_id: string | null;
  subcategory_id: string | null;
  sku: string | null;
  barcode: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  width_cm: number | null;
  depth_cm: number | null;
  brand: string | null;
  tags: string[] | null;
  mpn: string | null;
  free_shipping: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

function buildNuvemRow(p: ProductRow, catName: string, subName: string) {
  const cats = [catName, subName].filter(Boolean).join(' > ');
  const sizeCsv = (p.sizes || []).join(',');
  const colorCsv = (p.colors || []).join(',');
  const imgs = p.images || [];
  return {
    'Identificador de URL': p.slug || '',
    'Nome': p.name,
    'Categorias': cats,
    'Nome da variação 1': sizeCsv ? 'Tamanho' : '',
    'Valor da variação 1': sizeCsv,
    'Nome da variação 2': colorCsv ? 'Cor' : '',
    'Valor da variação 2': colorCsv,
    'Nome da variação 3': '',
    'Valor da variação 3': '',
    'Preço': p.price?.toFixed(2) ?? '',
    'Preço promocional': p.wholesale_price ? p.wholesale_price.toFixed(2) : '',
    'Peso (kg)': p.weight_kg ?? '',
    'Altura (cm)': p.height_cm ?? '',
    'Largura (cm)': p.width_cm ?? '',
    'Profundidade (cm)': p.depth_cm ?? '',
    'Estoque': p.stock ?? 0,
    'SKU': p.sku ?? '',
    'Código de barras': p.barcode ?? '',
    'Mostrar na loja': p.is_active ? 'SIM' : 'NÃO',
    'Frete grátis': p.free_shipping ? 'SIM' : 'NÃO',
    'MPN (Cód. Exclusivo, Modelo ou Refer.)': p.mpn ?? '',
    'Marca': p.brand ?? '',
    'Tags': (p.tags || []).join(','),
    'Título para SEO': p.meta_title ?? '',
    'Descrição para SEO': p.meta_description ?? '',
    'Descrição': p.description ?? '',
    'Imagem 1': imgs[0] ?? '',
    'Imagem 2': imgs[1] ?? '',
    'Imagem 3': imgs[2] ?? '',
    'Imagem 4': imgs[3] ?? '',
    'Imagem 5': imgs[4] ?? '',
  };
}

function download(filename: string, content: string | Blob, mime = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ProductImportExport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [subcategories, setSubcategories] = useState<Record<string, { name: string; category_id: string }>>({});
  const [importLog, setImportLog] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }, { data: subs }] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('categories').select('id, name, slug'),
      supabase.from('subcategories').select('id, name, slug, category_id'),
    ]);
    setProducts((prods as any) || []);
    const cmap: Record<string, string> = {};
    (cats || []).forEach((c: any) => { cmap[c.id] = c.name; });
    setCategories(cmap);
    const smap: Record<string, { name: string; category_id: string }> = {};
    (subs || []).forEach((s: any) => { smap[s.id] = { name: s.name, category_id: s.category_id }; });
    setSubcategories(smap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const enrich = () => products.map((p) => ({
    p,
    catName: p.category_id ? (categories[p.category_id] || '') : '',
    subName: p.subcategory_id ? (subcategories[p.subcategory_id]?.name || '') : '',
  }));

  // ---------- CSV (Nuvemshop) ----------
  const exportCSV = () => {
    setExporting('csv');
    const rows = enrich().map(({ p, catName, subName }) => buildNuvemRow(p, catName, subName));
    const csv = Papa.unparse({ fields: NUVEMSHOP_HEADERS, data: rows.map(r => NUVEMSHOP_HEADERS.map(h => (r as any)[h] ?? '')) });
    download(`nuvemshop-produtos-${new Date().toISOString().slice(0, 10)}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
    setExporting(null);
    toast({ title: `${rows.length} produtos exportados em CSV` });
  };

  // ---------- XML (Nuvemshop / feed produto) ----------
  const exportXML = () => {
    setExporting('xml');
    const items = enrich().map(({ p, catName, subName }) => ({
      identificador: p.slug,
      nome: p.name,
      categoria: catName,
      subcategoria: subName,
      preco: p.price,
      preco_promocional: p.wholesale_price || '',
      peso_kg: p.weight_kg || '',
      altura_cm: p.height_cm || '',
      largura_cm: p.width_cm || '',
      profundidade_cm: p.depth_cm || '',
      estoque: p.stock,
      sku: p.sku || '',
      codigo_barras: p.barcode || '',
      marca: p.brand || '',
      mpn: p.mpn || '',
      mostrar_na_loja: p.is_active ? 'SIM' : 'NÃO',
      frete_gratis: p.free_shipping ? 'SIM' : 'NÃO',
      tamanhos: (p.sizes || []).join(','),
      cores: (p.colors || []).join(','),
      tags: (p.tags || []).join(','),
      titulo_seo: p.meta_title || '',
      descricao_seo: p.meta_description || '',
      descricao: p.description || '',
      imagens: { imagem: p.images || [] },
    }));
    const builder = new XMLBuilder({ format: true, ignoreAttributes: false, suppressEmptyNode: false });
    const xml = builder.build({
      '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
      catalogo: {
        '@_formato': 'nuvemshop',
        '@_gerado_em': new Date().toISOString(),
        produto: items,
      },
    });
    download(`nuvemshop-produtos-${new Date().toISOString().slice(0, 10)}.xml`, xml, 'application/xml;charset=utf-8;');
    setExporting(null);
    toast({ title: `${items.length} produtos exportados em XML` });
  };

  // ---------- PDF (catálogo) ----------
  const exportPDF = () => {
    setExporting('pdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(16);
    doc.text('Catálogo de Produtos — Lumera Store', 40, 40);
    doc.setFontSize(10);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} — ${products.length} produtos`, 40, 58);

    const body = enrich().map(({ p, catName, subName }) => [
      p.sku || '—',
      p.name,
      [catName, subName].filter(Boolean).join(' > ') || '—',
      `R$ ${Number(p.price || 0).toFixed(2)}`,
      p.wholesale_price ? `R$ ${Number(p.wholesale_price).toFixed(2)}` : '—',
      String(p.stock ?? 0),
      p.weight_kg ? `${p.weight_kg} kg` : '—',
      [p.height_cm, p.width_cm, p.depth_cm].some(Boolean)
        ? `${p.height_cm || 0}×${p.width_cm || 0}×${p.depth_cm || 0}` : '—',
      (p.sizes || []).join(', ') || '—',
      (p.colors || []).join(', ') || '—',
      p.is_active ? 'Ativo' : 'Inativo',
    ]);

    autoTable(doc, {
      head: [['SKU', 'Produto', 'Categoria', 'Preço', 'Atacado', 'Estoque', 'Peso', 'A×L×P (cm)', 'Tamanhos', 'Cores', 'Status']],
      body,
      startY: 75,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [136, 19, 55] },
      columnStyles: { 1: { cellWidth: 140 }, 2: { cellWidth: 110 } },
    });

    doc.save(`catalogo-produtos-${new Date().toISOString().slice(0, 10)}.pdf`);
    setExporting(null);
    toast({ title: `${products.length} produtos exportados em PDF` });
  };

  // ---------- Template CSV vazio ----------
  const downloadTemplate = () => {
    const csv = Papa.unparse({ fields: NUVEMSHOP_HEADERS, data: [] });
    download('template-nuvemshop.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8;');
    toast({ title: 'Template Nuvemshop baixado' });
  };

  // ---------- Import CSV/XML ----------
  const handleImport = async (file: File) => {
    setImporting(true);
    setImportLog([]);
    const log: string[] = [];
    let rows: any[] = [];

    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith('.xml')) {
        const parser = new XMLParser({ ignoreAttributes: true });
        const parsed = parser.parse(text);
        const items = parsed?.catalogo?.produto;
        const arr = Array.isArray(items) ? items : items ? [items] : [];
        rows = arr.map((it: any) => ({
          'Identificador de URL': it.identificador,
          'Nome': it.nome,
          'Categorias': [it.categoria, it.subcategoria].filter(Boolean).join(' > '),
          'Preço': it.preco,
          'Preço promocional': it.preco_promocional,
          'Peso (kg)': it.peso_kg,
          'Altura (cm)': it.altura_cm,
          'Largura (cm)': it.largura_cm,
          'Profundidade (cm)': it.profundidade_cm,
          'Estoque': it.estoque,
          'SKU': it.sku,
          'Código de barras': it.codigo_barras,
          'Marca': it.marca,
          'MPN (Cód. Exclusivo, Modelo ou Refer.)': it.mpn,
          'Mostrar na loja': it.mostrar_na_loja,
          'Frete grátis': it.frete_gratis,
          'Valor da variação 1': it.tamanhos,
          'Valor da variação 2': it.cores,
          'Tags': it.tags,
          'Título para SEO': it.titulo_seo,
          'Descrição para SEO': it.descricao_seo,
          'Descrição': it.descricao,
        }));
      } else {
        const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
        rows = parsed.data;
      }

      log.push(`Lidas ${rows.length} linhas do arquivo.`);
      // category cache (by name)
      const catByName: Record<string, string> = {};
      const subByName: Record<string, string> = {};
      Object.entries(categories).forEach(([id, name]) => { catByName[name.toLowerCase()] = id; });
      Object.entries(subcategories).forEach(([id, s]) => { subByName[s.name.toLowerCase()] = id; });

      let created = 0, updated = 0, failed = 0;
      for (const row of rows) {
        try {
          const name = (row['Nome'] || '').trim();
          if (!name) { failed++; continue; }
          const slug = (row['Identificador de URL'] || '').trim() || slugify(name);
          const catPath = String(row['Categorias'] || '').split('>').map((s) => s.trim()).filter(Boolean);
          const catId = catPath[0] ? catByName[catPath[0].toLowerCase()] || null : null;
          const subId = catPath[1] ? subByName[catPath[1].toLowerCase()] || null : null;
          const sizes = String(row['Valor da variação 1'] || '').split(',').map((s) => s.trim()).filter(Boolean);
          const colors = String(row['Valor da variação 2'] || '').split(',').map((s) => s.trim()).filter(Boolean);
          const tags = String(row['Tags'] || '').split(',').map((s) => s.trim()).filter(Boolean);
          const images = ['Imagem 1', 'Imagem 2', 'Imagem 3', 'Imagem 4', 'Imagem 5']
            .map((k) => String(row[k] || '').trim()).filter(Boolean);

          const num = (v: any) => {
            if (v === '' || v == null) return null;
            const n = Number(String(v).replace(',', '.'));
            return isFinite(n) ? n : null;
          };
          const bool = (v: any) => ['SIM', 'TRUE', '1', 'YES'].includes(String(v).toUpperCase().trim());

          const payload: any = {
            name,
            slug,
            description: row['Descrição'] || null,
            price: num(row['Preço']) ?? 0,
            wholesale_price: num(row['Preço promocional']),
            stock: Math.round(num(row['Estoque']) ?? 0),
            sizes,
            colors,
            tags,
            images,
            category_id: catId,
            subcategory_id: subId,
            sku: row['SKU'] || null,
            barcode: row['Código de barras'] || null,
            weight_kg: num(row['Peso (kg)']),
            height_cm: num(row['Altura (cm)']),
            width_cm: num(row['Largura (cm)']),
            depth_cm: num(row['Profundidade (cm)']),
            brand: row['Marca'] || null,
            mpn: row['MPN (Cód. Exclusivo, Modelo ou Refer.)'] || null,
            is_active: row['Mostrar na loja'] ? bool(row['Mostrar na loja']) : true,
            free_shipping: bool(row['Frete grátis']),
            meta_title: row['Título para SEO'] || null,
            meta_description: row['Descrição para SEO'] || null,
          };

          const { data: existing } = await supabase
            .from('products').select('id').eq('slug', slug).maybeSingle();
          if (existing) {
            const { error } = await supabase.from('products').update(payload).eq('id', existing.id);
            if (error) throw error;
            updated++;
          } else {
            const { error } = await supabase.from('products').insert(payload);
            if (error) throw error;
            created++;
          }
        } catch (e: any) {
          failed++;
          log.push(`✗ ${row['Nome'] || '(sem nome)'}: ${e.message}`);
        }
      }
      log.push(`✓ Importação concluída: ${created} criados, ${updated} atualizados, ${failed} falhas.`);
      toast({ title: 'Importação concluída', description: `${created} criados • ${updated} atualizados • ${failed} falhas` });
      await load();
    } catch (e: any) {
      log.push(`Erro ao processar arquivo: ${e.message}`);
      toast({ title: 'Falha na importação', description: e.message, variant: 'destructive' });
    } finally {
      setImportLog(log);
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Importar / Exportar Produtos</h1>
        <p className="text-muted-foreground">
          Catálogo completo no formato <strong>Nuvemshop</strong> — CSV, XML e PDF.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary">{loading ? '...' : products.length} produtos</Badge>
        <Badge variant="outline">{Object.keys(categories).length} categorias</Badge>
        <Badge variant="outline">{Object.keys(subcategories).length} subcategorias</Badge>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList>
          <TabsTrigger value="export"><Download className="h-4 w-4 mr-2" />Exportar</TabsTrigger>
          <TabsTrigger value="import"><Upload className="h-4 w-4 mr-2" />Importar</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="grid gap-4 md:grid-cols-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" />CSV Nuvemshop</CardTitle>
              <CardDescription>
                Planilha pronta para importar na Nuvemshop. Todos os campos: preço, peso, dimensões, SKU, variações, SEO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportCSV} disabled={loading || !!exporting} className="w-full">
                {exporting === 'csv' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Baixar CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileJson className="h-5 w-5" />XML Catálogo</CardTitle>
              <CardDescription>
                Feed XML estruturado com todos os produtos, categorias, dimensões e imagens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportXML} disabled={loading || !!exporting} className="w-full">
                {exporting === 'xml' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Baixar XML
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />PDF Catálogo</CardTitle>
              <CardDescription>
                Catálogo impresso em PDF com tabela completa de produtos, preços e estoque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportPDF} disabled={loading || !!exporting} className="w-full">
                {exporting === 'pdf' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Baixar PDF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar de CSV ou XML</CardTitle>
              <CardDescription>
                Aceita o formato Nuvemshop (CSV) e o XML gerado por esta tela. Produtos com slug já existente são atualizados; novos são criados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" /> Baixar template Nuvemshop
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xml,text/csv,application/xml,text/xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImport(f);
                  }}
                />
                <Button onClick={() => fileRef.current?.click()} disabled={importing}>
                  {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Selecionar arquivo
                </Button>
              </div>

              <Alert>
                <AlertTitle>Mapeamento de categorias</AlertTitle>
                <AlertDescription>
                  Use o formato <code>Categoria &gt; Subcategoria</code> na coluna "Categorias".
                  Categorias e subcategorias devem existir previamente — caso contrário, o produto é importado sem vínculo.
                </AlertDescription>
              </Alert>

              {importLog.length > 0 && (
                <div className="rounded-md border bg-muted/50 p-3 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
                  {importLog.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
