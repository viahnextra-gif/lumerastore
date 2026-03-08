import { useState } from 'react';
import { Bot, Mail, Star, Clock, Save, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  name: string;
  type: 'follow_up' | 'satisfaction' | 'review_request' | 'cross_sell';
  trigger: string;
  delay_hours: number;
  message_template: string;
  is_active: boolean;
  marketplace: string;
}

const defaultRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Acompanhamento de Entrega',
    type: 'follow_up',
    trigger: 'order_delivered',
    delay_hours: 2,
    message_template: 'Olá {customer_name}! Seu pedido #{order_id} foi entregue. Tudo certo com os produtos? Estamos à disposição!',
    is_active: true,
    marketplace: 'all',
  },
  {
    id: '2',
    name: 'Pesquisa de Satisfação',
    type: 'satisfaction',
    trigger: 'order_delivered',
    delay_hours: 72,
    message_template: 'Olá {customer_name}! Como foi sua experiência com o pedido #{order_id}? De 1 a 5, qual nota você daria? Sua opinião é muito importante para nós!',
    is_active: true,
    marketplace: 'all',
  },
  {
    id: '3',
    name: 'Solicitar Avaliação',
    type: 'review_request',
    trigger: 'order_delivered',
    delay_hours: 168,
    message_template: 'Olá {customer_name}! Esperamos que esteja amando seus produtos! Poderia nos avaliar no marketplace? Isso nos ajuda muito! ⭐',
    is_active: false,
    marketplace: 'mercadolivre',
  },
  {
    id: '4',
    name: 'Cross-sell Pós-Venda',
    type: 'cross_sell',
    trigger: 'order_delivered',
    delay_hours: 336,
    message_template: 'Olá {customer_name}! Temos novidades que combinam com sua última compra. Confira as peças da nova coleção! 🛍️',
    is_active: false,
    marketplace: 'all',
  },
];

export default function PostSaleAutomation() {
  const { t } = useLanguage();
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
    toast.success(t('mk.automationUpdated'));
  };

  const saveRule = () => {
    if (!editingRule) return;
    setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
    setEditingRule(null);
    toast.success(t('mk.ruleSaved'));
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'follow_up': return <Mail className="h-4 w-4" />;
      case 'satisfaction': return <Star className="h-4 w-4" />;
      case 'review_request': return <Star className="h-4 w-4 fill-current" />;
      case 'cross_sell': return <Zap className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'follow_up': return t('mk.followUp');
      case 'satisfaction': return t('mk.satisfaction');
      case 'review_request': return t('mk.reviewRequest');
      case 'cross_sell': return t('mk.crossSell');
      default: return type;
    }
  };

  const formatDelay = (hours: number) => {
    if (hours < 24) return `${hours}${t('mk.hourAfterDelivery')}`;
    const days = Math.floor(hours / 24);
    return `${days} ${days > 1 ? t('mk.daysAfterDelivery') : t('mk.dayAfterDelivery')}`;
  };

  const activeCount = rules.filter(r => r.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            {t('mk.postSaleAutomation')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('mk.postSaleAutomation.subtitle')}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {activeCount} {activeCount !== 1 ? t('mk.activeCountPlural') : t('mk.activeCount')}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('mk.msgSent')}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('mk.responseRate')}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-500">0%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('mk.avgSatisfaction')}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-500">--</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('mk.reviewsObtained')}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-500">0</p></CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${rule.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {typeIcon(rule.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{rule.name}</h3>
                      <Badge variant="outline" className="text-xs">{typeLabel(rule.type)}</Badge>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDelay(rule.delay_hours)}
                      </Badge>
                      {rule.marketplace !== 'all' && (
                        <Badge className="text-xs">{rule.marketplace}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{rule.message_template}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule)}>{t('mk.edit')}</Button>
                  <Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule.id)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog inline */}
      {editingRule && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">{t('mk.editRule')}: {editingRule.name}</CardTitle>
            <CardDescription>{t('mk.configTriggerTime')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('mk.name')}</Label>
                <Input value={editingRule.name} onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('mk.delayHours')}</Label>
                <Input type="number" value={editingRule.delay_hours} onChange={(e) => setEditingRule({ ...editingRule, delay_hours: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('mk.marketplace')}</Label>
              <Select value={editingRule.marketplace} onValueChange={(v) => setEditingRule({ ...editingRule, marketplace: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('mk.all')}</SelectItem>
                  <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
                  <SelectItem value="shopee">Shopee</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="magalu">Magalu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('mk.messageTemplate')}</Label>
              <Textarea value={editingRule.message_template} onChange={(e) => setEditingRule({ ...editingRule, message_template: e.target.value })} rows={4} />
              <p className="text-xs text-muted-foreground">{t('mk.variables')}: {'{customer_name}'}, {'{order_id}'}, {'{product_name}'}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingRule(null)}>{t('mk.cancel')}</Button>
              <Button onClick={saveRule}><Save className="h-4 w-4 mr-1" /> {t('mk.save')}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
