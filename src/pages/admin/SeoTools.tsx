import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Loader2, AlertTriangle, CheckCircle2, FileSearch, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  buildPublicRoutePreviews,
  type RouteMetaPreview,
} from '@/lib/seo/routePreviews';
import { scanLegacyBrandReferences, type LegacyHit } from '@/lib/seo/legacyBrandScanner';

interface PingResult {
  engine: string;
  url: string;
  status: number;
  ok: boolean;
  error?: string;
}

export default function SeoTools() {
  const { toast } = useToast();
  const [pinging, setPinging] = useState(false);
  const [pingResults, setPingResults] = useState<PingResult[] | null>(null);

  const [previews, setPreviews] = useState<RouteMetaPreview[]>([]);
  const [auditResults, setAuditResults] = useState<LegacyHit[] | null>(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    setPreviews(buildPublicRoutePreviews());
  }, []);

  const handlePing = async () => {
    setPinging(true);
    setPingResults(null);
    try {
      const { data, error } = await supabase.functions.invoke('ping-search-engines', {
        body: {},
      });
      if (error) throw error;
      setPingResults(data?.results ?? []);
      toast({ title: 'Notificação enviada para Google e Bing' });
    } catch (e) {
      toast({
        title: 'Falha ao notificar buscadores',
        description: e instanceof Error ? e.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setPinging(false);
    }
  };

  const handleAudit = async () => {
    setAuditing(true);
    try {
      const hits = await scanLegacyBrandReferences();
      setAuditResults(hits);
      if (hits.length === 0) {
        toast({ title: 'Tudo limpo!', description: 'Nenhuma referência legada encontrada.' });
      } else {
        toast({
          title: `${hits.length} referência(s) suspeita(s) encontradas`,
          variant: 'destructive',
        });
      }
    } catch (e) {
      toast({
        title: 'Erro na auditoria',
        description: e instanceof Error ? e.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Ferramentas de SEO</h1>
        <p className="text-muted-foreground">
          Pré-visualize meta tags, audite termos legados e notifique buscadores sobre o sitemap.
        </p>
      </div>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preview" className="gap-2">
            <Tag className="h-4 w-4" /> Preview de Meta Tags
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileSearch className="h-4 w-4" /> Auditoria Legado
          </TabsTrigger>
          <TabsTrigger value="ping" className="gap-2">
            <Send className="h-4 w-4" /> Sitemap & Buscadores
          </TabsTrigger>
        </TabsList>

        {/* Preview tab */}
        <TabsContent value="preview" className="space-y-4">
          {previews.map((p) => (
            <motion.div key={p.path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="font-mono text-base">{p.path}</CardTitle>
                      <CardDescription>{p.label}</CardDescription>
                    </div>
                    <Badge variant="outline">{p.canonical}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <MetaRow label="title" value={p.title} />
                    <MetaRow label="description" value={p.description} />
                    <MetaRow label="og:title" value={p.title} />
                    <MetaRow label="og:description" value={p.description} />
                    <MetaRow label="og:image" value={p.ogImage} />
                    <MetaRow label="twitter:card" value="summary_large_image" />
                    <MetaRow label="twitter:title" value={p.title} />
                    <MetaRow label="twitter:image" value={p.ogImage} />
                  </div>
                  {p.jsonLdTypes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        JSON-LD
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {p.jsonLdTypes.map((t) => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Audit tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Scanner de termos legados</CardTitle>
              <CardDescription>
                Varre o sitemap, robots.txt e DOM da home/admin atrás de referências a
                "Wakai", "Meca Store" ou "mecastore". O domínio publicado{' '}
                <code>lojawakai.lovable.app</code> é ignorado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleAudit} disabled={auditing}>
                {auditing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Search className="h-4 w-4 mr-2" /> Rodar auditoria
              </Button>

              {auditResults?.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Tudo limpo</AlertTitle>
                  <AlertDescription>
                    Nenhuma referência aos nomes antigos encontrada nos artefatos públicos.
                  </AlertDescription>
                </Alert>
              )}

              {auditResults && auditResults.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{auditResults.length} referência(s) encontrada(s)</AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-64 mt-2">
                      <ul className="space-y-2 text-xs font-mono">
                        {auditResults.map((h, i) => (
                          <li key={i} className="border-l-2 border-destructive pl-2">
                            <div className="font-bold">[{h.source}] {h.match}</div>
                            <div className="text-muted-foreground break-all">{h.context}</div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ping tab */}
        <TabsContent value="ping">
          <Card>
            <CardHeader>
              <CardTitle>Notificar Google e Bing sobre o sitemap</CardTitle>
              <CardDescription>
                Use após publicar mudanças no sitemap.xml. Um cron diário roda
                automaticamente às 08:00 UTC.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handlePing} disabled={pinging}>
                {pinging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" /> Notificar agora
              </Button>

              {pingResults && (
                <div className="space-y-2">
                  {pingResults.map((r) => (
                    <div
                      key={r.engine}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium capitalize">{r.engine}</p>
                        <p className="text-xs text-muted-foreground break-all">{r.url}</p>
                      </div>
                      <Badge variant={r.ok ? 'default' : 'destructive'}>
                        HTTP {r.status || 'ERR'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono text-xs break-words">{value}</p>
    </div>
  );
}
