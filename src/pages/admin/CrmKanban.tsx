import { useState, useEffect } from 'react';
import { Loader2, Plus, Mail, Phone, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Lead { id: string; name: string | null; email: string | null; phone: string | null; message: string | null; source: string; status: string; score: number; notes: string | null; created_at: string; }

export default function CrmKanban() {
  const { t, language } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', source: 'manual' });
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [autoRespondLoading, setAutoRespondLoading] = useState<string | null>(null);
  const [autoRespondResult, setAutoRespondResult] = useState<{ response_message: string; action_suggestion: string; recommended_channel: string } | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const { toast } = useToast();

  const columns = [
    { id: 'cold', title: t('admin.statusCold'), color: 'bg-blue-500' },
    { id: 'warm', title: t('admin.statusWarm'), color: 'bg-yellow-500' },
    { id: 'hot', title: t('admin.statusHot'), color: 'bg-orange-500' },
    { id: 'converted', title: t('admin.statusConverted'), color: 'bg-green-500' },
  ];

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try { const { data, error } = await supabase.from('leads').select('*').order('score', { ascending: false }); if (error) throw error; setLeads(data || []); } catch (error) { console.error('Error:', error); } finally { setIsLoading(false); }
  };

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedLead) return;
    try { const { error } = await supabase.from('leads').update({ status: newStatus as 'cold' | 'warm' | 'hot' | 'converted' }).eq('id', draggedLead); if (error) throw error; setLeads(leads.map((l) => l.id === draggedLead ? { ...l, status: newStatus } : l)); toast({ title: t('admin.leadUpdated') }); } catch { toast({ title: 'Error', variant: 'destructive' }); }
    setDraggedLead(null);
  };

  const handleSaveLead = async () => {
    setIsSaving(true);
    try { const { error } = await supabase.from('leads').insert({ name: formData.name || null, email: formData.email || null, phone: formData.phone || null, message: formData.message || null, source: 'manual', status: 'cold' as const, score: 0 }); if (error) throw error; setIsDialogOpen(false); setFormData({ name: '', email: '', phone: '', message: '', source: 'manual' }); fetchLeads(); toast({ title: t('admin.leadCreated') }); } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); } finally { setIsSaving(false); }
  };

  const handleAiClassify = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lead-scoring', { body: { leads: leads.map((l) => ({ id: l.id, name: l.name, email: l.email, message: l.message, source: l.source, score: l.score })) } });
      if (error) throw error;
      if (data?.results) {
        for (const result of data.results) { await supabase.from('leads').update({ score: result.score, status: result.status as 'cold' | 'warm' | 'hot' | 'converted', notes: result.suggestion }).eq('id', result.id); }
        fetchLeads();
        toast({ title: t('admin.aiClassifyDone'), description: `${data.results.length} ${t('admin.leadsUpdated')}` });
      }
    } catch { toast({ title: t('admin.aiUnavailable'), description: t('admin.configureAI'), variant: 'destructive' }); } finally { setAiLoading(false); }
  };

  const handleAutoRespond = async (leadId: string) => {
    setAutoRespondLoading(leadId);
    try { const { data, error } = await supabase.functions.invoke('ai-lead-autorespond', { body: { leadId } }); if (error) throw error; if (data?.error) throw new Error(data.error); setAutoRespondResult(data); setShowResponseDialog(true); fetchLeads(); toast({ title: t('admin.aiResponseGenerated') }); } catch (error: any) { toast({ title: 'Error', description: error.message || t('admin.couldNotGenerate'), variant: 'destructive' }); } finally { setAutoRespondLoading(null); }
  };

  const getColumnLeads = (status: string) => leads.filter((l) => l.status === status);
  const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-PY' : 'en-US';

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.crmTitle')}</h1>
          <p className="text-muted-foreground">{t('admin.crmSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAiClassify} disabled={aiLoading || leads.length === 0}>
            {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t('admin.classifyAI')}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> {t('admin.newLead')}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('admin.newLead')}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>{t('admin.nameLabel')}</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('admin.emailLabel')}</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('admin.phoneFormLabel')}</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('admin.messageLabel')}</Label><Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('admin.cancel')}</Button>
                <Button onClick={handleSaveLead} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t('admin.createLead')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('admin.aiResponseTitle')}</DialogTitle></DialogHeader>
          {autoRespondResult && (
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label className="text-xs text-muted-foreground">{t('admin.recommendedChannel')}</Label><Badge variant="outline" className="capitalize">{autoRespondResult.recommended_channel}</Badge></div>
              <div className="space-y-2"><Label className="text-xs text-muted-foreground">{t('admin.actionSuggestion')}</Label><p className="text-sm bg-muted p-3 rounded-lg">{autoRespondResult.action_suggestion}</p></div>
              <div className="space-y-2"><Label className="text-xs text-muted-foreground">{t('admin.messageForLead')}</Label><div className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{autoRespondResult.response_message}</div></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setShowResponseDialog(false)}>{t('admin.close')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)} className="min-h-[400px]">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${col.color}`} /><CardTitle className="text-sm font-medium">{col.title}</CardTitle></div>
                  <Badge variant="secondary">{getColumnLeads(col.id).length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {getColumnLeads(col.id).map((lead) => (
                  <div key={lead.id} draggable onDragStart={() => handleDragStart(lead.id)} className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{lead.name || t('admin.noName')}</p>
                      <Badge variant="outline" className="text-xs">{lead.score}pts</Badge>
                    </div>
                    {lead.email && <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Mail className="h-3 w-3" />{lead.email}</p>}
                    {lead.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Phone className="h-3 w-3" />{lead.phone}</p>}
                    {lead.notes && <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/50 flex items-start gap-1"><Sparkles className="h-3 w-3 mt-0.5 shrink-0 text-primary" /><span className="line-clamp-3">{lead.notes}</span></p>}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</p>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleAutoRespond(lead.id); }} disabled={autoRespondLoading === lead.id}>
                        {autoRespondLoading === lead.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Send className="h-3 w-3 mr-1" /> IA</>}
                      </Button>
                    </div>
                  </div>
                ))}
                {getColumnLeads(col.id).length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">{t('admin.dragLeadsHere')}</div>}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
