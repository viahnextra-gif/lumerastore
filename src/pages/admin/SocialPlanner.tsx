import { useState, useEffect } from 'react';
import { Plus, Loader2, Calendar as CalendarIcon, Instagram, Facebook, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string | null;
  scheduled_at: string;
  status: string;
  hashtags: string[];
}

const platformIcons: Record<string, string> = {
  instagram: '📸',
  facebook: '📘',
  tiktok: '🎵',
  pinterest: '📌',
  x: '𝕏',
};

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-800 border-pink-200',
  facebook: 'bg-blue-100 text-blue-800 border-blue-200',
  tiktok: 'bg-slate-100 text-slate-800 border-slate-200',
  pinterest: 'bg-red-100 text-red-800 border-red-200',
  x: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function SocialPlanner() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'instagram', content: '', scheduled_at: '', hashtags: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchPosts(); }, [currentDate]);

  const fetchPosts = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .gte('scheduled_at', startOfMonth)
        .lte('scheduled_at', endOfMonth)
        .order('scheduled_at');
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('scheduled_posts').insert({
        platform: formData.platform,
        content: formData.content || null,
        scheduled_at: formData.scheduled_at,
        hashtags: formData.hashtags.split(',').map((h) => h.trim()).filter(Boolean),
        status: 'scheduled',
      });
      if (error) throw error;
      setIsDialogOpen(false);
      setFormData({ platform: 'instagram', content: '', scheduled_at: '', hashtags: '' });
      fetchPosts();
      toast({ title: 'Post agendado' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1));
  };

  // Build calendar grid
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const getPostsForDay = (day: number) =>
    posts.filter((p) => new Date(p.scheduled_at).getDate() === day);

  const monthName = currentDate.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Planner Social</h1>
          <p className="text-muted-foreground">Calendario de publicaciones en redes sociales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nuevo Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Agendar Post</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">📸 Instagram</SelectItem>
                    <SelectItem value="facebook">📘 Facebook</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                    <SelectItem value="pinterest">📌 Pinterest</SelectItem>
                    <SelectItem value="x">𝕏 X (Twitter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} placeholder="Texto del post..." />
              </div>
              <div className="space-y-2">
                <Label>Fecha y hora</Label>
                <Input type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hashtags (separados por coma)</Label>
                <Input value={formData.hashtags} onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })} placeholder="#moda, #fashion, #mecapy" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.scheduled_at}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}><ChevronLeft className="h-5 w-5" /></Button>
            <CardTitle className="capitalize">{monthName}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
              <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dayPosts = day ? getPostsForDay(day) : [];
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              return (
                <div key={i} className={`bg-card min-h-[80px] p-1 ${!day ? 'bg-muted/30' : ''}`}>
                  {day && (
                    <>
                      <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayPosts.slice(0, 3).map((post) => (
                          <div key={post.id} className={`text-[10px] px-1 py-0.5 rounded truncate border ${platformColors[post.platform] || ''}`}>
                            {platformIcons[post.platform]} {post.content?.slice(0, 20) || 'Post'}
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <p className="text-[10px] text-muted-foreground text-center">+{dayPosts.length - 3} más</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming posts list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximas Publicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay posts agendados este mes</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{platformIcons[post.platform]}</span>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{post.content || 'Sin contenido'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.scheduled_at).toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[post.status]}>{post.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
