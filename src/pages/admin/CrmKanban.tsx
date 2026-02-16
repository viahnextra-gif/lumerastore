import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Mail, Phone, Sparkles, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  status: string;
  score: number;
  notes: string | null;
  created_at: string;
}

const columns = [
  { id: 'cold', title: 'Frío', color: 'bg-blue-500' },
  { id: 'warm', title: 'Tibio', color: 'bg-yellow-500' },
  { id: 'hot', title: 'Caliente', color: 'bg-orange-500' },
  { id: 'converted', title: 'Convertido', color: 'bg-green-500' },
];

export default function CrmKanban() {
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

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('score', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedLead) return;
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus as 'cold' | 'warm' | 'hot' | 'converted' })
        .eq('id', draggedLead);
      if (error) throw error;
      setLeads(leads.map((l) => l.id === draggedLead ? { ...l, status: newStatus } : l));
      toast({ title: 'Lead actualizado' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setDraggedLead(null);
  };

  const handleSaveLead = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('leads').insert({
        name: formData.name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        message: formData.message || null,
        source: 'manual',
        status: 'cold' as const,
        score: 0,
      });
      if (error) throw error;
      setIsDialogOpen(false);
      setFormData({ name: '', email: '', phone: '', message: '', source: 'manual' });
      fetchLeads();
      toast({ title: 'Lead creado' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiClassify = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lead-scoring', {
        body: { leads: leads.map((l) => ({ id: l.id, name: l.name, email: l.email, message: l.message, source: l.source, score: l.score })) },
      });
      if (error) throw error;
      if (data?.results) {
        for (const result of data.results) {
          await supabase.from('leads').update({
            score: result.score,
            status: result.status as 'cold' | 'warm' | 'hot' | 'converted',
            notes: result.suggestion,
          }).eq('id', result.id);
        }
        fetchLeads();
        toast({ title: 'Clasificación IA completada', description: `${data.results.length} leads actualizados` });
      }
    } catch {
      toast({ title: 'IA no disponible', description: 'Configure la función de IA', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAutoRespond = async (leadId: string) => {
    setAutoRespondLoading(leadId);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lead-autorespond', {
        body: { leadId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAutoRespondResult(data);
      setShowResponseDialog(true);
      fetchLeads();
      toast({ title: 'Respuesta IA generada' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo generar respuesta', variant: 'destructive' });
    } finally {
      setAutoRespondLoading(null);
    }
  };

  const getColumnLeads = (status: string) => leads.filter((l) => l.status === status);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">CRM Kanban</h1>
          <p className="text-muted-foreground">Pipeline de leads con drag & drop e IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAiClassify} disabled={aiLoading || leads.length === 0}>
            {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Clasificar con IA
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nuevo Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo Lead</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Teléfono</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Mensaje</Label><Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveLead} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Crear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>🤖 Respuesta IA Generada</DialogTitle></DialogHeader>
          {autoRespondResult && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Canal recomendado</Label>
                <Badge variant="outline" className="capitalize">{autoRespondResult.recommended_channel}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Sugerencia de acción</Label>
                <p className="text-sm bg-muted p-3 rounded-lg">{autoRespondResult.action_suggestion}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Mensaje para el lead</Label>
                <div className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{autoRespondResult.response_message}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)} className="min-h-[400px]">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                    <CardTitle className="text-sm font-medium">{col.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{getColumnLeads(col.id).length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {getColumnLeads(col.id).map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{lead.name || 'Sin nombre'}</p>
                      <Badge variant="outline" className="text-xs">{lead.score}pts</Badge>
                    </div>
                    {lead.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Mail className="h-3 w-3" />{lead.email}
                      </p>
                    )}
                    {lead.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Phone className="h-3 w-3" />{lead.phone}
                      </p>
                    )}
                    {lead.notes && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/50 flex items-start gap-1">
                        <Sparkles className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                        <span className="line-clamp-3">{lead.notes}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => { e.stopPropagation(); handleAutoRespond(lead.id); }}
                        disabled={autoRespondLoading === lead.id}
                      >
                        {autoRespondLoading === lead.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <><Send className="h-3 w-3 mr-1" /> IA</>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {getColumnLeads(col.id).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Arrastra leads aquí
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
