import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Webhook, Plus, Save, Trash2, Copy,
  ArrowRight, Mail, MessageSquare, Bell, Database, ShoppingCart,
  Package, Users, Star, Clock, Filter, GitBranch, Send, FileText,
  BarChart3, AlertTriangle, CheckCircle2, XCircle, Settings,
  GripVertical, ChevronDown, ExternalLink, History, RefreshCw, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AutomationMetricsDashboard from '@/components/admin/AutomationMetricsDashboard';

// ── Types ──────────────────────────────────────────────
type Platform = 'n8n' | 'make' | 'fiqon';
type NodeCategory = 'trigger' | 'action' | 'condition' | 'output';

interface NodeTemplate {
  id: string;
  category: NodeCategory;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  fields: NodeField[];
  platforms: Platform[];
}

interface NodeField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'toggle';
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
}

interface FlowNode {
  id: string;
  templateId: string;
  config: Record<string, string>;
  enabled: boolean;
}

interface AutomationFlow {
  id: string;
  name: string;
  platform: Platform;
  webhookUrl: string;
  nodes: FlowNode[];
  enabled: boolean;
  createdAt: string;
  lastRun: string | null;
  status: 'active' | 'error' | 'idle' | 'draft';
  dbId?: string; // DB UUID
}

interface ExecutionLog {
  id: string;
  flow_id: string;
  status: string;
  trigger_event: string | null;
  trigger_payload: any;
  result: any;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  flow_name?: string;
}

// ── Pre-Programmed Node Templates ──────────────────────
const NODE_TEMPLATES: NodeTemplate[] = [
  // TRIGGERS
  {
    id: 'trigger_new_order', category: 'trigger', name: 'Novo Pedido', description: 'Dispara quando um novo pedido é criado no marketplace',
    icon: ShoppingCart, color: 'bg-green-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'marketplace', label: 'Marketplace', type: 'select', options: [
        { value: 'all', label: 'Todos' }, { value: 'mercadolivre', label: 'Mercado Livre' },
        { value: 'shopee', label: 'Shopee' }, { value: 'amazon', label: 'Amazon' }, { value: 'magalu', label: 'Magalu' },
      ], defaultValue: 'all' },
      { key: 'min_value', label: 'Valor mínimo (₲)', type: 'number', placeholder: '0' },
    ],
  },
  {
    id: 'trigger_order_status', category: 'trigger', name: 'Status do Pedido Alterado', description: 'Dispara quando o status de um pedido muda',
    icon: Package, color: 'bg-blue-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'from_status', label: 'De Status', type: 'select', options: [
        { value: 'any', label: 'Qualquer' }, { value: 'pending', label: 'Pendente' }, { value: 'confirmed', label: 'Confirmado' },
        { value: 'processing', label: 'Processando' }, { value: 'shipped', label: 'Enviado' },
      ], defaultValue: 'any' },
      { key: 'to_status', label: 'Para Status', type: 'select', options: [
        { value: 'confirmed', label: 'Confirmado' }, { value: 'shipped', label: 'Enviado' }, { value: 'delivered', label: 'Entregue' }, { value: 'cancelled', label: 'Cancelado' },
      ], defaultValue: 'shipped' },
    ],
  },
  {
    id: 'trigger_new_message', category: 'trigger', name: 'Nova Mensagem', description: 'Dispara quando uma nova mensagem é recebida',
    icon: MessageSquare, color: 'bg-purple-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'marketplace', label: 'Marketplace', type: 'select', options: [
        { value: 'all', label: 'Todos' }, { value: 'mercadolivre', label: 'Mercado Livre' }, { value: 'shopee', label: 'Shopee' },
      ], defaultValue: 'all' },
    ],
  },
  {
    id: 'trigger_stock_low', category: 'trigger', name: 'Estoque Baixo', description: 'Dispara quando o estoque atinge o nível mínimo',
    icon: AlertTriangle, color: 'bg-yellow-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'threshold', label: 'Qtd Mínima', type: 'number', placeholder: '5', defaultValue: '5' },
    ],
  },
  {
    id: 'trigger_new_lead', category: 'trigger', name: 'Novo Lead', description: 'Dispara quando um novo lead é capturado',
    icon: Users, color: 'bg-indigo-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'source', label: 'Fonte', type: 'select', options: [
        { value: 'all', label: 'Todas' }, { value: 'chatbot', label: 'Chatbot' }, { value: 'website', label: 'Website' }, { value: 'marketplace', label: 'Marketplace' },
      ], defaultValue: 'all' },
      { key: 'min_score', label: 'Score Mínimo', type: 'number', placeholder: '0' },
    ],
  },
  {
    id: 'trigger_review', category: 'trigger', name: 'Avaliação Recebida', description: 'Dispara quando uma avaliação é recebida',
    icon: Star, color: 'bg-amber-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'min_rating', label: 'Rating Mínimo', type: 'select', options: [
        { value: '1', label: '1 ⭐' }, { value: '2', label: '2 ⭐' }, { value: '3', label: '3 ⭐' }, { value: '4', label: '4 ⭐' }, { value: '5', label: '5 ⭐' },
      ], defaultValue: '1' },
    ],
  },
  {
    id: 'trigger_sync_error', category: 'trigger', name: 'Erro de Sincronização', description: 'Dispara quando ocorre erro de sync',
    icon: XCircle, color: 'bg-red-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'operation', label: 'Tipo Operação', type: 'select', options: [
        { value: 'all', label: 'Todas' }, { value: 'catalog', label: 'Catálogo' }, { value: 'stock', label: 'Estoque' }, { value: 'price', label: 'Preço' },
      ], defaultValue: 'all' },
    ],
  },
  {
    id: 'trigger_scheduled', category: 'trigger', name: 'Agendamento (Cron)', description: 'Executa em intervalos regulares',
    icon: Clock, color: 'bg-slate-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'interval', label: 'Intervalo', type: 'select', options: [
        { value: '5m', label: 'A cada 5 minutos' }, { value: '15m', label: 'A cada 15 minutos' }, { value: '1h', label: 'A cada 1 hora' },
        { value: '6h', label: 'A cada 6 horas' }, { value: '24h', label: 'Diário' },
      ], defaultValue: '1h' },
    ],
  },

  // CONDITIONS
  {
    id: 'condition_filter', category: 'condition', name: 'Filtro Condicional', description: 'Filtra dados por condição',
    icon: Filter, color: 'bg-cyan-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'field', label: 'Campo', type: 'text', placeholder: 'Ex: order.total' },
      { key: 'operator', label: 'Operador', type: 'select', options: [
        { value: 'eq', label: 'Igual a' }, { value: 'gt', label: 'Maior que' }, { value: 'lt', label: 'Menor que' },
        { value: 'contains', label: 'Contém' }, { value: 'not_empty', label: 'Não vazio' },
      ], defaultValue: 'eq' },
      { key: 'value', label: 'Valor', type: 'text', placeholder: 'Valor para comparar' },
    ],
  },
  {
    id: 'condition_branch', category: 'condition', name: 'Ramificação (If/Else)', description: 'Divide o fluxo em dois caminhos',
    icon: GitBranch, color: 'bg-teal-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'condition', label: 'Condição', type: 'text', placeholder: 'Ex: {{status}} == "delivered"' },
      { key: 'true_label', label: 'Label Verdadeiro', type: 'text', defaultValue: 'Sim' },
      { key: 'false_label', label: 'Label Falso', type: 'text', defaultValue: 'Não' },
    ],
  },

  // ACTIONS
  {
    id: 'action_send_email', category: 'action', name: 'Enviar E-mail', description: 'Envia um e-mail personalizado',
    icon: Mail, color: 'bg-rose-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'to', label: 'Destinatário', type: 'text', placeholder: '{{customer.email}}' },
      { key: 'subject', label: 'Assunto', type: 'text', placeholder: 'Seu pedido foi enviado!' },
      { key: 'body', label: 'Corpo do E-mail', type: 'textarea', placeholder: 'Olá {{customer.name}},...' },
    ],
  },
  {
    id: 'action_send_whatsapp', category: 'action', name: 'Enviar WhatsApp', description: 'Envia mensagem via WhatsApp',
    icon: Send, color: 'bg-green-600', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'phone', label: 'Telefone', type: 'text', placeholder: '{{customer.phone}}' },
      { key: 'message', label: 'Mensagem', type: 'textarea', placeholder: 'Olá {{customer.name}}, seu pedido...' },
      { key: 'template_id', label: 'Template ID (opcional)', type: 'text', placeholder: 'order_confirmation' },
    ],
  },
  {
    id: 'action_notify_team', category: 'action', name: 'Notificar Equipe', description: 'Envia notificação interna para a equipe',
    icon: Bell, color: 'bg-orange-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'channel', label: 'Canal', type: 'select', options: [
        { value: 'slack', label: 'Slack' }, { value: 'discord', label: 'Discord' }, { value: 'telegram', label: 'Telegram' }, { value: 'email', label: 'E-mail' },
      ], defaultValue: 'slack' },
      { key: 'message', label: 'Mensagem', type: 'textarea', placeholder: '⚠️ Novo pedido #{{order.number}}' },
    ],
  },
  {
    id: 'action_update_db', category: 'action', name: 'Atualizar Banco de Dados', description: 'Atualiza registros no banco de dados',
    icon: Database, color: 'bg-sky-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'table', label: 'Tabela', type: 'select', options: [
        { value: 'orders', label: 'Pedidos' }, { value: 'products', label: 'Produtos' }, { value: 'leads', label: 'Leads' }, { value: 'profiles', label: 'Perfis' },
      ], defaultValue: 'orders' },
      { key: 'action', label: 'Ação', type: 'select', options: [
        { value: 'update', label: 'Atualizar' }, { value: 'insert', label: 'Inserir' }, { value: 'upsert', label: 'Upsert' },
      ], defaultValue: 'update' },
      { key: 'data', label: 'Dados (JSON)', type: 'textarea', placeholder: '{"status": "confirmed"}' },
    ],
  },
  {
    id: 'action_create_invoice', category: 'action', name: 'Gerar Nota Fiscal', description: 'Gera NF/recibo automático',
    icon: FileText, color: 'bg-lime-600', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'type', label: 'Tipo', type: 'select', options: [
        { value: 'nfe', label: 'NF-e' }, { value: 'nfce', label: 'NFC-e' }, { value: 'receipt', label: 'Recibo' },
      ], defaultValue: 'receipt' },
    ],
  },
  {
    id: 'action_sync_stock', category: 'action', name: 'Sincronizar Estoque', description: 'Atualiza estoque entre marketplaces',
    icon: Package, color: 'bg-violet-600', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'direction', label: 'Direção', type: 'select', options: [
        { value: 'local_to_mk', label: 'Local → Marketplace' }, { value: 'mk_to_local', label: 'Marketplace → Local' }, { value: 'bidirectional', label: 'Bidirecional' },
      ], defaultValue: 'local_to_mk' },
      { key: 'marketplace', label: 'Marketplace', type: 'select', options: [
        { value: 'all', label: 'Todos' }, { value: 'mercadolivre', label: 'Mercado Livre' }, { value: 'shopee', label: 'Shopee' },
      ], defaultValue: 'all' },
    ],
  },

  // OUTPUTS
  {
    id: 'output_log', category: 'output', name: 'Registrar Log', description: 'Salva log da execução no sistema',
    icon: BarChart3, color: 'bg-gray-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'level', label: 'Nível', type: 'select', options: [
        { value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' },
      ], defaultValue: 'info' },
      { key: 'message', label: 'Mensagem', type: 'text', placeholder: 'Automação executada com sucesso' },
    ],
  },
  {
    id: 'output_webhook', category: 'output', name: 'Chamar Webhook Externo', description: 'Envia dados para webhook externo',
    icon: Webhook, color: 'bg-pink-500', platforms: ['n8n', 'make', 'fiqon'],
    fields: [
      { key: 'url', label: 'URL do Webhook', type: 'text', placeholder: 'https://...', required: true },
      { key: 'method', label: 'Método', type: 'select', options: [
        { value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }, { value: 'GET', label: 'GET' },
      ], defaultValue: 'POST' },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer ..."}' },
    ],
  },
];

const FLOW_TEMPLATES: { id: string; name: string; description: string; platform: Platform; nodes: { templateId: string; config: Record<string, string> }[] }[] = [
  {
    id: 'tpl_order_whatsapp', name: '📦 Pedido → WhatsApp', description: 'Envia WhatsApp automático quando novo pedido chega',
    platform: 'n8n',
    nodes: [
      { templateId: 'trigger_new_order', config: { marketplace: 'all', min_value: '0' } },
      { templateId: 'action_send_whatsapp', config: { phone: '{{customer.phone}}', message: 'Olá {{customer.name}}! Recebemos seu pedido #{{order.number}}.', template_id: '' } },
      { templateId: 'output_log', config: { level: 'info', message: 'WhatsApp enviado para {{customer.name}}' } },
    ],
  },
  {
    id: 'tpl_stock_alert', name: '⚠️ Alerta Estoque Baixo', description: 'Notifica equipe quando estoque está baixo',
    platform: 'make',
    nodes: [
      { templateId: 'trigger_stock_low', config: { threshold: '5' } },
      { templateId: 'action_notify_team', config: { channel: 'slack', message: '⚠️ Produto {{product.name}} com estoque baixo: {{product.stock}} unidades' } },
    ],
  },
  {
    id: 'tpl_post_sale', name: '⭐ Pós-Venda Automático', description: 'Envia e-mail de satisfação após entrega',
    platform: 'fiqon',
    nodes: [
      { templateId: 'trigger_order_status', config: { from_status: 'shipped', to_status: 'delivered' } },
      { templateId: 'condition_filter', config: { field: 'order.total', operator: 'gt', value: '100000' } },
      { templateId: 'action_send_email', config: { to: '{{customer.email}}', subject: 'Como foi sua compra? ⭐', body: 'Olá {{customer.name}}, gostaríamos de saber sua opinião...' } },
    ],
  },
  {
    id: 'tpl_lead_nurture', name: '🎯 Nutrição de Lead', description: 'Responde automaticamente novos leads quentes',
    platform: 'n8n',
    nodes: [
      { templateId: 'trigger_new_lead', config: { source: 'all', min_score: '70' } },
      { templateId: 'condition_branch', config: { condition: '{{lead.score}} >= 80', true_label: 'Hot Lead', false_label: 'Warm Lead' } },
      { templateId: 'action_send_whatsapp', config: { phone: '{{lead.phone}}', message: 'Olá {{lead.name}}! Vi que você se interessou pelos nossos produtos.', template_id: '' } },
      { templateId: 'action_notify_team', config: { channel: 'slack', message: '🎯 Novo lead quente: {{lead.name}} (score: {{lead.score}})' } },
    ],
  },
  {
    id: 'tpl_sync_error_alert', name: '🚨 Alerta Erro de Sync', description: 'Notifica erros de sincronização em tempo real',
    platform: 'make',
    nodes: [
      { templateId: 'trigger_sync_error', config: { operation: 'all' } },
      { templateId: 'action_notify_team', config: { channel: 'telegram', message: '🚨 Erro de sync no {{marketplace}}: {{error_details}}' } },
      { templateId: 'output_log', config: { level: 'error', message: 'Sync error alertado: {{error_details}}' } },
    ],
  },
];

const PLATFORMS_INFO = [
  { id: 'n8n' as Platform, label: 'n8n', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200', iconColor: 'text-orange-500' },
  { id: 'make' as Platform, label: 'Make', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200', iconColor: 'text-violet-500' },
  { id: 'fiqon' as Platform, label: 'FiqOn', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200', iconColor: 'text-emerald-500' },
];

const categoryLabels: Record<NodeCategory, { label: string; color: string }> = {
  trigger: { label: '⚡ Gatilho', color: 'border-green-500/50 bg-green-500/5' },
  condition: { label: '🔀 Condição', color: 'border-cyan-500/50 bg-cyan-500/5' },
  action: { label: '⚙️ Ação', color: 'border-blue-500/50 bg-blue-500/5' },
  output: { label: '📤 Saída', color: 'border-gray-500/50 bg-gray-500/5' },
};

// ── Component ──────────────────────────────────────────
export default function MarketplaceAutomations() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [activeTab, setActiveTab] = useState('flows');
  const [editingFlow, setEditingFlow] = useState<AutomationFlow | null>(null);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [nodePickerCategory, setNodePickerCategory] = useState<NodeCategory | 'all'>('all');
  const [editingNodeIdx, setEditingNodeIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Load from DB ──
  const loadFlows = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('automation_flows')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setFlows(data.map((row: any) => ({
        id: row.id,
        dbId: row.id,
        name: row.name,
        platform: row.platform as Platform,
        webhookUrl: row.webhook_url || '',
        nodes: (row.nodes as FlowNode[]) || [],
        enabled: row.enabled,
        createdAt: row.created_at,
        lastRun: row.last_run_at,
        status: row.status as AutomationFlow['status'],
      })));
    }
    setLoading(false);
  }, [user]);

  const loadExecutions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('automation_executions')
      .select('*, automation_flows(name)')
      .order('started_at', { ascending: false })
      .limit(50);

    if (data) {
      setExecutions(data.map((row: any) => ({
        ...row,
        flow_name: (row.automation_flows as any)?.name || t('mk.flowRemoved'),
      })));
    }
  }, [user]);

  useEffect(() => {
    loadFlows();
    loadExecutions();
  }, [loadFlows, loadExecutions]);

  // Realtime execution updates
  useEffect(() => {
    const channel = supabase
      .channel('automation-executions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'automation_executions' }, () => {
        loadExecutions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadExecutions]);

  // ── Flow CRUD (persisted) ──
  const saveFlowToDB = async (flow: AutomationFlow) => {
    if (!user) return;
    const payload = {
      tenant_id: user.id,
      name: flow.name,
      platform: flow.platform,
      webhook_url: flow.webhookUrl,
      nodes: flow.nodes as any,
      enabled: flow.enabled,
      status: flow.status,
    };

    if (flow.dbId) {
      await supabase.from('automation_flows').update(payload).eq('id', flow.dbId);
    } else {
      const { data } = await supabase.from('automation_flows').insert(payload).select().single();
      if (data) flow.dbId = data.id;
    }
  };

  const createFlowFromTemplate = (tpl: typeof FLOW_TEMPLATES[0]) => {
    const flow: AutomationFlow = {
      id: crypto.randomUUID(),
      name: tpl.name,
      platform: tpl.platform,
      webhookUrl: '',
      nodes: tpl.nodes.map((n) => ({ id: crypto.randomUUID(), templateId: n.templateId, config: { ...n.config }, enabled: true })),
      enabled: false,
      createdAt: new Date().toISOString(),
      lastRun: null,
      status: 'draft',
    };
    setEditingFlow(flow);
    setActiveTab('editor');
    toast.success(t('mk.templateLoaded'));
  };

  const createEmptyFlow = () => {
    const flow: AutomationFlow = {
      id: crypto.randomUUID(),
      name: t('mk.newAutomationBtn'),
      platform: 'n8n',
      webhookUrl: '',
      nodes: [],
      enabled: false,
      createdAt: new Date().toISOString(),
      lastRun: null,
      status: 'draft',
    };
    setEditingFlow(flow);
    setActiveTab('editor');
  };

  const saveFlow = async () => {
    if (!editingFlow) return;
    if (!editingFlow.name.trim()) { toast.error(t('mk.giveNameToAutomation')); return; }
    if (editingFlow.nodes.length === 0) { toast.error(t('mk.addAtLeastOneNode')); return; }

    await saveFlowToDB(editingFlow);
    await loadFlows();
    toast.success(t('mk.automationSavedDB'));
    setEditingFlow(null);
    setActiveTab('flows');
  };

  const deleteFlow = async (id: string, dbId?: string) => {
    if (dbId) {
      await supabase.from('automation_flows').delete().eq('id', dbId);
    }
    await loadFlows();
    toast.success(t('mk.automationRemoved'));
  };

  const duplicateFlow = async (flow: AutomationFlow) => {
    if (!user) return;
    const { data } = await supabase.from('automation_flows').insert({
      tenant_id: user.id,
      name: `${flow.name} (cópia)`,
      platform: flow.platform,
      webhook_url: flow.webhookUrl,
      nodes: flow.nodes.map((n) => ({ ...n, id: crypto.randomUUID() })) as any,
      enabled: false,
      status: 'draft',
    }).select().single();
    if (data) {
      await loadFlows();
      toast.success(t('mk.automationDuplicated'));
    }
  };

  const toggleFlow = async (dbId: string, currentEnabled: boolean) => {
    await supabase.from('automation_flows').update({
      enabled: !currentEnabled,
      status: !currentEnabled ? 'active' : 'idle',
    }).eq('id', dbId);
    await loadFlows();
  };

  const testFlow = async (flow: AutomationFlow) => {
    if (!user || !flow.dbId) return;
    toast.info(t('mk.testingAutomation'));
    const { error } = await supabase.functions.invoke('automation-webhook', {
      body: {
        event_type: 'order.created',
        tenant_id: user.id,
        payload: { test: true, order: { number: 'TEST-001', total: 50000 }, customer: { name: 'Teste', email: 'test@test.com' } },
      },
    });
    if (error) toast.error(t('mk.testError') + ': ' + error.message);
    else { toast.success(t('mk.testExecuted')); loadExecutions(); }
  };

  // ── Node Management ──
  const addNodeToFlow = (template: NodeTemplate) => {
    if (!editingFlow) return;
    const node: FlowNode = { id: crypto.randomUUID(), templateId: template.id, config: {}, enabled: true };
    template.fields.forEach((f) => { if (f.defaultValue) node.config[f.key] = f.defaultValue; });
    setEditingFlow({ ...editingFlow, nodes: [...editingFlow.nodes, node] });
    setShowNodePicker(false);
    setEditingNodeIdx(editingFlow.nodes.length);
  };

  const removeNode = (idx: number) => {
    if (!editingFlow) return;
    const nodes = [...editingFlow.nodes];
    nodes.splice(idx, 1);
    setEditingFlow({ ...editingFlow, nodes });
    if (editingNodeIdx === idx) setEditingNodeIdx(null);
  };

  const updateNodeConfig = (idx: number, key: string, value: string) => {
    if (!editingFlow) return;
    const nodes = [...editingFlow.nodes];
    nodes[idx] = { ...nodes[idx], config: { ...nodes[idx].config, [key]: value } };
    setEditingFlow({ ...editingFlow, nodes });
  };

  const moveNode = (idx: number, dir: -1 | 1) => {
    if (!editingFlow) return;
    const nodes = [...editingFlow.nodes];
    const target = idx + dir;
    if (target < 0 || target >= nodes.length) return;
    [nodes[idx], nodes[target]] = [nodes[target], nodes[idx]];
    setEditingFlow({ ...editingFlow, nodes });
    if (editingNodeIdx === idx) setEditingNodeIdx(target);
  };

  const getTemplate = (id: string) => NODE_TEMPLATES.find((t) => t.id === id);
  const getPlatform = (id: Platform) => PLATFORMS_INFO.find((p) => p.id === id)!;

  const filteredTemplates = nodePickerCategory === 'all'
    ? NODE_TEMPLATES.filter((t) => !editingFlow || t.platforms.includes(editingFlow.platform))
    : NODE_TEMPLATES.filter((t) => t.category === nodePickerCategory && (!editingFlow || t.platforms.includes(editingFlow.platform)));

  const exportFlowJSON = (flow: AutomationFlow) => {
    const json = {
      name: flow.name,
      platform: flow.platform,
      webhook: flow.webhookUrl,
      nodes: flow.nodes.map((n) => {
        const tpl = getTemplate(n.templateId);
        return { type: tpl?.category, name: tpl?.name, config: n.config, enabled: n.enabled };
      }),
    };
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast.success(t('mk.jsonCopied') + ' ' + flow.platform.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('mk.automations')}</h1>
          <p className="text-sm text-muted-foreground">{t('mk.automations.subtitle')}</p>
        </div>
        <Button onClick={createEmptyFlow}><Plus className="h-4 w-4 mr-2" /> {t('mk.newAutomationBtn')}</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="flows">{t('mk.myAutomations')} ({flows.length})</TabsTrigger>
          <TabsTrigger value="templates">{t('mk.readyTemplates')}</TabsTrigger>
          <TabsTrigger value="nodes">{t('mk.nodeLibrary')}</TabsTrigger>
          <TabsTrigger value="logs"><History className="h-3.5 w-3.5 mr-1" /> {t('mk.executionLogs')}</TabsTrigger>
          <TabsTrigger value="metrics"><BarChart3 className="h-3.5 w-3.5 mr-1" /> {t('mk.metrics')}</TabsTrigger>
          {editingFlow && <TabsTrigger value="editor">✏️ {t('mk.editor')}</TabsTrigger>}
        </TabsList>

        {/* ── Flows List ── */}
        <TabsContent value="flows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLATFORMS_INFO.map((p) => {
              const count = flows.filter((f) => f.platform === p.id).length;
              const active = flows.filter((f) => f.platform === p.id && f.enabled).length;
              return (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={p.color}>{p.label}</Badge>
                      <Zap className={cn('h-4 w-4', p.iconColor)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">{count} {t('mk.flows')}</span>
                      <span className="text-green-600">{active} {t('mk.activeFlows')}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {flows.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">{t('mk.noAutomationsCreated')}</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">{t('mk.startWithTemplate')}</p>
                <Button variant="outline" onClick={() => setActiveTab('templates')}>{t('mk.viewTemplates')}</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {flows.map((flow) => {
                const platform = getPlatform(flow.platform);
                return (
                  <Card key={flow.id} className={cn(!flow.enabled && 'opacity-60')}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch checked={flow.enabled} onCheckedChange={() => flow.dbId && toggleFlow(flow.dbId, flow.enabled)} />
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${platform.color}`}>{platform.label}</Badge>
                              <span className="font-medium text-sm">{flow.name}</span>
                              {flow.status === 'active' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                              {flow.status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                              {flow.status === 'draft' && <Badge variant="outline" className="text-xs">{t('mk.draft')}</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {flow.nodes.length} {t('mk.nodes')} • {t('mk.createdOn')} {new Date(flow.createdAt).toLocaleDateString()}
                              {flow.lastRun && ` • ${t('mk.lastExecution')}: ${new Date(flow.lastRun).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {flow.enabled && (
                            <Button variant="ghost" size="sm" onClick={() => testFlow(flow)} title="Testar">
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => { setEditingFlow({ ...flow }); setActiveTab('editor'); }}>
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => exportFlowJSON(flow)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => duplicateFlow(flow)}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteFlow(flow.id, flow.dbId)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {/* Mini flow preview */}
                      <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
                        {flow.nodes.map((node, i) => {
                          const tpl = getTemplate(node.templateId);
                          if (!tpl) return null;
                          return (
                            <div key={node.id} className="flex items-center gap-1">
                              <div className={cn('flex items-center gap-1 px-2 py-1 rounded text-xs border', categoryLabels[tpl.category].color)}>
                                <tpl.icon className="h-3 w-3" />
                                <span className="whitespace-nowrap">{tpl.name}</span>
                              </div>
                              {i < flow.nodes.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Templates ── */}
        <TabsContent value="templates" className="space-y-4">
          <p className="text-sm text-muted-foreground">Templates prontos com nós pré-configurados. Escolha, personalize e ative.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FLOW_TEMPLATES.map((tpl) => {
              const platform = getPlatform(tpl.platform);
              return (
                <Card key={tpl.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => createFlowFromTemplate(tpl)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{tpl.name}</CardTitle>
                      <Badge className={`text-xs ${platform.color}`}>{platform.label}</Badge>
                    </div>
                    <CardDescription className="text-xs">{tpl.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 flex-wrap">
                      {tpl.nodes.map((n, i) => {
                        const nodeTpl = getTemplate(n.templateId);
                        if (!nodeTpl) return null;
                        return (
                          <div key={i} className="flex items-center gap-1">
                            <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border', categoryLabels[nodeTpl.category].color)}>
                              <nodeTpl.icon className="h-2.5 w-2.5" />
                              <span className="whitespace-nowrap">{nodeTpl.name}</span>
                            </div>
                            {i < tpl.nodes.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                          </div>
                        );
                      })}
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full" onClick={(e) => { e.stopPropagation(); createFlowFromTemplate(tpl); }}>
                      <Plus className="h-3 w-3 mr-1" /> Usar Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Nodes Library ── */}
        <TabsContent value="nodes" className="space-y-4">
          <p className="text-sm text-muted-foreground">Todos os nós disponíveis para construir suas automações.</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={nodePickerCategory === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setNodePickerCategory('all')}>Todos</Badge>
            {(Object.entries(categoryLabels) as [NodeCategory, { label: string }][]).map(([cat, info]) => (
              <Badge key={cat} variant={nodePickerCategory === cat ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setNodePickerCategory(cat)}>{info.label}</Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(nodePickerCategory === 'all' ? NODE_TEMPLATES : NODE_TEMPLATES.filter((n) => n.category === nodePickerCategory)).map((tpl) => (
              <Card key={tpl.id} className={cn('border', categoryLabels[tpl.category].color)}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={cn('p-1.5 rounded', tpl.color)}>
                      <tpl.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tpl.description}</p>
                      <div className="flex gap-1 mt-1.5">
                        {tpl.platforms.map((p) => (
                          <Badge key={p} variant="outline" className="text-[9px] px-1 py-0">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Execution Logs ── */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Histórico de execuções das automações com status de sucesso/falha.</p>
            <Button variant="outline" size="sm" onClick={loadExecutions}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Atualizar</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {executions.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma execução registrada</p>
                  <p className="text-xs text-muted-foreground mt-1">As execuções aparecerão aqui quando suas automações forem disparadas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Automação</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Erro</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((exec) => {
                      const duration = exec.completed_at
                        ? Math.round((new Date(exec.completed_at).getTime() - new Date(exec.started_at).getTime()) / 1000)
                        : null;
                      return (
                        <TableRow key={exec.id}>
                          <TableCell>
                            {exec.status === 'success' && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 text-xs">✓ Sucesso</Badge>}
                            {exec.status === 'failed' && <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 text-xs">✗ Falha</Badge>}
                            {exec.status === 'running' && <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 text-xs">⟳ Executando</Badge>}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{exec.flow_name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{exec.trigger_event || '—'}</Badge></TableCell>
                          <TableCell className="text-xs text-red-500 max-w-[200px] truncate">{exec.error_message || '—'}</TableCell>
                          <TableCell className="text-xs">{new Date(exec.started_at).toLocaleString()}</TableCell>
                          <TableCell className="text-xs">{duration !== null ? `${duration}s` : '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Metrics Dashboard ── */}
        <TabsContent value="metrics" className="space-y-4">
          <AutomationMetricsDashboard executions={executions} />
        </TabsContent>

        {/* ── Flow Editor ── */}
        <TabsContent value="editor">
          {editingFlow && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome da Automação</Label>
                      <Input value={editingFlow.name} onChange={(e) => setEditingFlow({ ...editingFlow, name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Plataforma</Label>
                      <Select value={editingFlow.platform} onValueChange={(v) => setEditingFlow({ ...editingFlow, platform: v as Platform })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PLATFORMS_INFO.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Webhook URL</Label>
                      <Input value={editingFlow.webhookUrl} onChange={(e) => setEditingFlow({ ...editingFlow, webhookUrl: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flow Canvas */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Fluxo ({editingFlow.nodes.length} nós)</h3>
                    <Button size="sm" variant="outline" onClick={() => setShowNodePicker(true)}>
                      <Plus className="h-3 w-3 mr-1" /> Adicionar Nó
                    </Button>
                  </div>

                  {editingFlow.nodes.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Adicione nós para construir seu fluxo</p>
                        <Button size="sm" className="mt-3" onClick={() => setShowNodePicker(true)}>Adicionar Primeiro Nó</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {editingFlow.nodes.map((node, idx) => {
                        const tpl = getTemplate(node.templateId);
                        if (!tpl) return null;
                        const isEditing = editingNodeIdx === idx;
                        return (
                          <div key={node.id}>
                            <Card
                              className={cn('border-l-4 cursor-pointer transition-all', categoryLabels[tpl.category].color, isEditing && 'ring-2 ring-primary')}
                              onClick={() => setEditingNodeIdx(isEditing ? null : idx)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                    <div className={cn('p-1 rounded', tpl.color)}>
                                      <tpl.icon className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{tpl.name}</p>
                                      <p className="text-[10px] text-muted-foreground">{tpl.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-[10px]">{categoryLabels[tpl.category].label}</Badge>
                                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isEditing && 'rotate-180')} />
                                  </div>
                                </div>

                                {isEditing && (
                                  <div className="mt-3 pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {tpl.fields.map((field) => (
                                        <div key={field.key} className="space-y-1">
                                          <Label className="text-xs">{field.label}</Label>
                                          {field.type === 'select' ? (
                                            <Select value={node.config[field.key] || field.defaultValue || ''} onValueChange={(v) => updateNodeConfig(idx, field.key, v)}>
                                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                {field.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                              </SelectContent>
                                            </Select>
                                          ) : field.type === 'textarea' ? (
                                            <Textarea className="text-xs min-h-[60px]" value={node.config[field.key] || ''} onChange={(e) => updateNodeConfig(idx, field.key, e.target.value)} placeholder={field.placeholder} />
                                          ) : (
                                            <Input className="h-8 text-xs" type={field.type === 'number' ? 'number' : 'text'} value={node.config[field.key] || ''} onChange={(e) => updateNodeConfig(idx, field.key, e.target.value)} placeholder={field.placeholder} />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="ghost" onClick={() => moveNode(idx, -1)} disabled={idx === 0}>↑</Button>
                                      <Button size="sm" variant="ghost" onClick={() => moveNode(idx, 1)} disabled={idx === editingFlow.nodes.length - 1}>↓</Button>
                                      <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => removeNode(idx)}>
                                        <Trash2 className="h-3 w-3 mr-1" /> Remover
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            {idx < editingFlow.nodes.length - 1 && (
                              <div className="flex justify-center py-1">
                                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setEditingFlow(null); setActiveTab('flows'); }}>Cancelar</Button>
                <Button variant="outline" onClick={() => editingFlow && exportFlowJSON(editingFlow)}>
                  <Copy className="h-4 w-4 mr-2" /> Exportar JSON
                </Button>
                <Button onClick={saveFlow}><Save className="h-4 w-4 mr-2" /> Salvar Automação</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Node Picker Dialog */}
      <Dialog open={showNodePicker} onOpenChange={setShowNodePicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Adicionar Nó</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 flex-wrap mb-3">
            <Badge variant={nodePickerCategory === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setNodePickerCategory('all')}>Todos</Badge>
            {(Object.entries(categoryLabels) as [NodeCategory, { label: string }][]).map(([cat, info]) => (
              <Badge key={cat} variant={nodePickerCategory === cat ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setNodePickerCategory(cat)}>{info.label}</Badge>
            ))}
          </div>
          <ScrollArea className="max-h-[50vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredTemplates.map((tpl) => (
                <Card key={tpl.id} className={cn('cursor-pointer hover:border-primary/50 transition-colors border', categoryLabels[tpl.category].color)} onClick={() => addNodeToFlow(tpl)}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={cn('p-1.5 rounded shrink-0', tpl.color)}>
                        <tpl.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tpl.name}</p>
                        <p className="text-[10px] text-muted-foreground">{tpl.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
