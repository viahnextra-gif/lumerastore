import { useState } from 'react';
import { Zap, Webhook, ExternalLink, Plus, Save, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  platform: 'n8n' | 'make' | 'fiqon';
  name: string;
  webhookUrl: string;
  trigger: string;
  enabled: boolean;
  lastRun: string | null;
  status: 'active' | 'error' | 'idle';
}

const PLATFORMS = [
  { id: 'n8n', label: 'n8n', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', description: 'Open-source workflow automation' },
  { id: 'make', label: 'Make (Integromat)', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', description: 'Visual automation platform' },
  { id: 'fiqon', label: 'FiqOn', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', description: 'Brazilian iPaaS platform' },
];

const TRIGGERS = [
  { id: 'new_order', label: 'Novo Pedido Marketplace' },
  { id: 'order_shipped', label: 'Pedido Enviado' },
  { id: 'order_delivered', label: 'Pedido Entregue' },
  { id: 'new_message', label: 'Nova Mensagem Cliente' },
  { id: 'stock_low', label: 'Estoque Baixo' },
  { id: 'sync_error', label: 'Erro de Sincronização' },
  { id: 'new_lead', label: 'Novo Lead Capturado' },
  { id: 'review_received', label: 'Avaliação Recebida' },
];

export default function MarketplaceAutomations() {
  const { t } = useLanguage();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ platform: 'n8n' as 'n8n' | 'make' | 'fiqon', name: '', webhookUrl: '', trigger: 'new_order' });

  const handleAdd = () => {
    if (!newRule.name || !newRule.webhookUrl) {
      toast.error('Preencha nome e URL do webhook');
      return;
    }
    const rule: AutomationRule = {
      id: crypto.randomUUID(),
      ...newRule,
      enabled: true,
      lastRun: null,
      status: 'idle',
    };
    setRules([...rules, rule]);
    setNewRule({ platform: 'n8n', name: '', webhookUrl: '', trigger: 'new_order' });
    setShowAdd(false);
    toast.success('Automação adicionada!');
  };

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    toast.success('Automação removida');
  };

  const testWebhook = async (rule: AutomationRule) => {
    try {
      toast.info(`Testando webhook ${rule.name}...`);
      // In production this would actually call the webhook
      setTimeout(() => toast.success(`Webhook ${rule.name} testado com sucesso!`), 1000);
    } catch {
      toast.error('Erro ao testar webhook');
    }
  };

  const getPlatformInfo = (id: string) => PLATFORMS.find((p) => p.id === id)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('mk.automations')}</h1>
          <p className="text-sm text-muted-foreground">{t('mk.automations.subtitle')}</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-2" /> {t('mk.addAutomation')}
        </Button>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLATFORMS.map((p) => {
          const count = rules.filter((r) => r.platform === p.id).length;
          const active = rules.filter((r) => r.platform === p.id && r.enabled).length;
          return (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={p.color}>{p.label}</Badge>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription className="text-xs mt-1">{p.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">{count} {t('mk.rules')}</span>
                  <span className="text-green-600">{active} {t('mk.activeRules')}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('mk.newAutomation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('mk.platform')}</Label>
                <Select value={newRule.platform} onValueChange={(v) => setNewRule({ ...newRule, platform: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('mk.triggerEvent')}</Label>
                <Select value={newRule.trigger} onValueChange={(v) => setNewRule({ ...newRule, trigger: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map((tr) => (
                      <SelectItem key={tr.id} value={tr.id}>{tr.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('mk.ruleName')}</Label>
                <Input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="Ex: Notificar novo pedido ML" />
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input value={newRule.webhookUrl} onChange={(e) => setNewRule({ ...newRule, webhookUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}><Save className="h-4 w-4 mr-2" /> {t('mk.save')}</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>{t('mk.cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Webhook className="h-4 w-4" /> {t('mk.configuredRules')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="py-12 text-center">
              <Zap className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t('mk.noAutomations')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure webhooks para n8n, Make ou FiqOn para automatizar seus fluxos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const platform = getPlatformInfo(rule.platform);
                const trigger = TRIGGERS.find((tr) => tr.id === rule.trigger);
                return (
                  <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${platform.color}`}>{platform.label}</Badge>
                          <span className="font-medium text-sm">{rule.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{trigger?.label}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{rule.webhookUrl}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rule.status === 'active' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {rule.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      <Button variant="ghost" size="sm" onClick={() => testWebhook(rule)}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
