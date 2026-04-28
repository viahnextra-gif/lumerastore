import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Send, Loader2, AlertTriangle, CheckCircle2, FileSearch, Tag,
  Bell, EyeOff, Eye, ExternalLink, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  buildPublicRoutePreviews,
  type RouteMetaPreview,
} from '@/lib/seo/routePreviews';
import { scanLegacyBrandReferences, type LegacyHit } from '@/lib/seo/legacyBrandScanner';
import { checkRoute, summarize, type RouteCheck, type Severity } from '@/lib/seo/metaChecklist';
import { hitKey, loadIgnored, toggleIgnored } from '@/lib/seo/ignoredHits';
import { useSeoAlerts } from '@/hooks/useSeoAlerts';

interface PingResult {
  engine: string;
  url: string;
  status: number;
  ok: boolean;
  error?: string;
}

const SEVERITY_BADGE: Record<Severity, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  ok: { label: 'OK', variant: 'secondary' },
  warning: { label: 'Atenção', variant: 'default' },
  error: { label: 'Erro', variant: 'destructive' },
};

export default function SeoTools() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'preview';

  const [pinging, setPinging] = useState(false);
  const [pingResults, setPingResults] = useState<PingResult[] | null>(null);

  const [previews, setPreviews] = useState<RouteMetaPreview[]>([]);
  const [auditResults, setAuditResults] = useState<LegacyHit[] | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [ignored, setIgnored] = useState<Set<string>>(() => loadIgnored());
  const [showIgnored, setShowIgnored] = useState(false);

  const { alerts, acknowledge, acknowledgeAll, recordAlert } = useSeoAlerts();

  useEffect(() => {
    setPreviews(buildPublicRoutePreviews());
  }, []);

  const checks: RouteCheck[] = useMemo(() => previews.map(checkRoute), [previews]);
  const summary = useMemo(() => summarize(checks), [checks]);

  const visibleHits = useMemo(() => {
    if (!auditResults) return [];
    return showIgnored
      ? auditResults
      : auditResults.filter((h) => !ignored.has(hitKey(h)));
  }, [auditResults, ignored, showIgnored]);

  const handlePing = async () => {
    setPinging(true);
    setPingResults(null);
    try {
      const { data, error } = await supabase.functions.invoke('ping-search-engines', {
        body: {},
      });
      if (error) throw error;
      const results = (data?.results ?? []) as PingResult[];
      setPingResults(results);
      const allOk = results.every((r) => r.ok);
      toast({
        title: allOk ? 'Notificação enviada para Google e Bing' : 'Ping concluído com falhas',
        variant: allOk ? 'default' : 'destructive',
      });
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
      const newOnes = hits.filter((h) => !ignored.has(hitKey(h)));
      if (newOnes.length === 0) {
        toast({ title: 'Tudo limpo!', description: 'Nenhuma referência legada encontrada.' });
      } else {
        toast({
          title: `${newOnes.length} referência(s) suspeita(s) encontradas`,
          variant: 'destructive',
        });
        // Emit a persistent alert so other admins are warned.
        await recordAlert({
          alert_type: 'legacy_brand_detected',
          severity: 'warning',
          message: `${newOnes.length} novas referência(s) à marca legada detectadas pela auditoria`,
          details: {
            hits: newOnes.slice(0, 20).map((h) => ({
              source: h.source,
              sourceUrl: h.sourceUrl,
              line: h.line,
              match: h.match,
            })),
          },
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

  const handleToggleIgnored = (h: LegacyHit) => {
    setIgnored((prev) => toggleIgnored(h, prev));
  };

  const handleOpenSource = (h: LegacyHit) => {
    if (h.sourceUrl) {
      window.open(h.sourceUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Origem em DOM dinâmico',
        description: `Localizado em ${h.source}. Inspecione com DevTools.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Ferramentas de SEO</h1>
        <p className="text-muted-foreground">
          Pré-visualize meta tags, audite termos legados, gerencie alertas e notifique buscadores.
        </p>
      </div>

      <Tabs
        value={initialTab}
        onValueChange={(v) => setSearchParams({ tab: v })}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="preview" className="gap-2">
            <Tag className="h-4 w-4" /> Checklist Meta Tags
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileSearch className="h-4 w-4" /> Auditoria Legado
            {auditResults && auditResults.filter((h) => !ignored.has(hitKey(h))).length > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                {auditResults.filter((h) => !ignored.has(hitKey(h))).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" /> Alertas
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ping" className="gap-2">
            <Send className="h-4 w-4" /> Sitemap & Buscadores
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Checklist tab ---------------- */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da validação</CardTitle>
              <CardDescription>
                Regras: title 30–60, description 50–160 chars, og:image absoluto e canonical presentes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap text-sm">
                <Badge variant="secondary">{summary.ok} OK</Badge>
                <Badge>{summary.warnings} atenção</Badge>
                <Badge variant="destructive">{summary.errors} erro(s)</Badge>
                <span className="text-muted-foreground">de {summary.total} rotas</span>
              </div>
            </CardContent>
          </Card>

          {checks.map((c, i) => {
            const preview = previews[i];
            const sev = SEVERITY_BADGE[c.worst];
            return (
              <motion.div key={c.path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="font-mono text-base">{c.path}</CardTitle>
                        <CardDescription>{c.label}</CardDescription>
                      </div>
                      <Badge variant={sev.variant}>{sev.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <MetaRow
                        label={`title (${preview.title.length})`}
                        value={preview.title}
                        invalid={c.findings.some((f) => f.field === 'title')}
                      />
                      <MetaRow
                        label={`description (${preview.description.length})`}
                        value={preview.description}
                        invalid={c.findings.some((f) => f.field === 'description')}
                      />
                      <MetaRow
                        label="og:image"
                        value={preview.ogImage}
                        invalid={c.findings.some((f) => f.field === 'ogImage')}
                      />
                      <MetaRow
                        label="canonical"
                        value={preview.canonical}
                        invalid={c.findings.some((f) => f.field === 'canonical')}
                      />
                    </div>

                    {preview.jsonLdTypes.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">JSON-LD</p>
                        <div className="flex gap-2 flex-wrap">
                          {preview.jsonLdTypes.map((t) => (
                            <Badge key={t} variant="secondary">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {c.findings.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {c.findings.map((f, idx) => (
                          <div
                            key={idx}
                            className={`text-xs flex items-start gap-2 ${
                              f.severity === 'error' ? 'text-destructive' : 'text-amber-600 dark:text-amber-500'
                            }`}
                          >
                            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>
                              <strong>{f.field}:</strong> {f.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* ---------------- Audit tab ---------------- */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Scanner de termos legados</CardTitle>
              <CardDescription>
                Varre o sitemap, robots.txt e DOM da home/admin atrás de referências a
                "Wakai", "Meca Store" ou "mecastore". Hits podem ser ignorados localmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleAudit} disabled={auditing}>
                  {auditing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Search className="h-4 w-4 mr-2" /> Rodar auditoria
                </Button>
                <Button variant="outline" onClick={() => setShowIgnored((s) => !s)}>
                  {showIgnored ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showIgnored ? 'Ocultar ignorados' : 'Mostrar ignorados'}
                </Button>
                {ignored.size > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIgnored(new Set());
                      window.localStorage.removeItem('lumera.seo.ignoredHits.v1');
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Limpar ignorados ({ignored.size})
                  </Button>
                )}
              </div>

              {auditResults && visibleHits.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Tudo limpo</AlertTitle>
                  <AlertDescription>
                    Nenhuma referência ativa aos nomes antigos.
                    {ignored.size > 0 && ` (${ignored.size} ignorada(s))`}
                  </AlertDescription>
                </Alert>
              )}

              {visibleHits.length > 0 && (
                <ScrollArea className="h-[28rem] border rounded-md">
                  <ul className="divide-y">
                    {visibleHits.map((h, i) => {
                      const k = hitKey(h);
                      const isIgnored = ignored.has(k);
                      return (
                        <li
                          key={i}
                          className={`p-3 text-xs space-y-1 ${isIgnored ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Badge variant={isIgnored ? 'secondary' : 'destructive'}>
                                {h.match}
                              </Badge>
                              <span className="font-mono text-muted-foreground">
                                {h.source}
                                {h.line ? `:${h.line}` : ''}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => handleOpenSource(h)}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" /> Abrir trecho
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => handleToggleIgnored(h)}
                              >
                                {isIgnored ? (
                                  <>
                                    <Eye className="h-3 w-3 mr-1" /> Restaurar
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3 mr-1" /> Ignorar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground break-all pl-1 border-l-2 border-muted">
                            {h.context}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Alerts tab ---------------- */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Alertas automáticos</CardTitle>
                  <CardDescription>
                    Disparados pela auditoria de marca legada e por falhas no ping diário do sitemap.
                  </CardDescription>
                </div>
                {alerts.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => void acknowledgeAll()}>
                    Marcar todos como vistos
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Sem alertas pendentes</AlertTitle>
                  <AlertDescription>
                    Tudo certo. Novos alertas aparecerão aqui automaticamente.
                  </AlertDescription>
                </Alert>
              )}
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li
                    key={a.id}
                    className="border rounded-md p-3 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={a.severity === 'critical' ? 'destructive' : 'default'}
                        >
                          {a.severity}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {a.alert_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{a.message}</p>
                      {Object.keys(a.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            detalhes
                          </summary>
                          <pre className="text-[10px] mt-1 bg-muted p-2 rounded overflow-auto max-h-48">
                            {JSON.stringify(a.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void acknowledge(a.id)}
                    >
                      Marcar visto
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Ping tab ---------------- */}
        <TabsContent value="ping">
          <Card>
            <CardHeader>
              <CardTitle>Notificar Google e Bing sobre o sitemap</CardTitle>
              <CardDescription>
                Use após publicar mudanças no sitemap.xml. Um cron diário roda
                automaticamente às 08:00 UTC. Falhas geram alertas automáticos.
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
              <Separator />
              <p className="text-xs text-muted-foreground">
                Para inspecionar logs do cron, abra os logs da edge function{' '}
                <code>ping-search-engines</code>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetaRow({
  label,
  value,
  invalid,
}: {
  label: string;
  value: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <p className={`text-xs uppercase tracking-wide ${invalid ? 'text-destructive' : 'text-muted-foreground'}`}>
        {label}
      </p>
      <p className={`font-mono text-xs break-words ${invalid ? 'text-destructive' : ''}`}>
        {value || <span className="italic">— vazio —</span>}
      </p>
    </div>
  );
}
