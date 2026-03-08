import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function MarketplaceLogs() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    let q = supabase.from('marketplace_sync_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setLogs(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const handleRetry = async (logId: string) => {
    const res = await supabase.functions.invoke('marketplace-sync', {
      body: { operation: 'retry', log_id: logId },
    });
    if (res.error) toast.error(t('mk.error'));
    else { toast.success(t('mk.retryOk')); load(); }
  };

  const statusIcon = (s: string) => {
    if (s === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (s === 'fail') return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('mk.logs')}</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('mk.all')}</SelectItem>
            <SelectItem value="success">{t('mk.success')}</SelectItem>
            <SelectItem value="fail">{t('mk.fail')}</SelectItem>
            <SelectItem value="pending">{t('mk.pending')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('mk.noLogs')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('mk.statusCol')}</TableHead>
                  <TableHead>{t('mk.marketplace')}</TableHead>
                  <TableHead>{t('mk.operation')}</TableHead>
                  <TableHead>{t('mk.error')}</TableHead>
                  <TableHead>{t('mk.date')}</TableHead>
                  <TableHead>{t('mk.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{statusIcon(l.status)}</TableCell>
                    <TableCell className="capitalize">{l.marketplace}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{l.operation_type}</Badge></TableCell>
                    <TableCell className="text-xs text-red-500 max-w-[200px] truncate">{l.error_details || '—'}</TableCell>
                    <TableCell className="text-xs">{new Date(l.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {l.status === 'fail' && (
                        <Button variant="ghost" size="sm" onClick={() => handleRetry(l.id)}>
                          <RefreshCw className="h-3 w-3 mr-1" /> {t('mk.retry')}
                        </Button>
                      )}
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
