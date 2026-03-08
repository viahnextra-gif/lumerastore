import { useMemo } from 'react';
import { CheckCircle2, XCircle, Clock, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ExecutionLog {
  id: string;
  flow_id: string;
  status: string;
  trigger_event: string | null;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  flow_name?: string;
}

interface Props {
  executions: ExecutionLog[];
}

const chartConfig = {
  success: { label: 'Sucesso', color: 'hsl(142 71% 45%)' },
  failed: { label: 'Falha', color: 'hsl(0 84% 60%)' },
  running: { label: 'Executando', color: 'hsl(48 96% 53%)' },
};

const PIE_COLORS = ['hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)', 'hsl(48, 96%, 53%)'];

export default function AutomationMetricsDashboard({ executions }: Props) {
  const metrics = useMemo(() => {
    const total = executions.length;
    const success = executions.filter(e => e.status === 'success').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const running = executions.filter(e => e.status === 'running').length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    // Average execution time (only completed)
    const durations = executions
      .filter(e => e.completed_at && e.started_at)
      .map(e => (new Date(e.completed_at!).getTime() - new Date(e.started_at).getTime()) / 1000);
    const avgDuration = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) : '0';

    // Failures by flow
    const failuresByFlow: Record<string, number> = {};
    executions.filter(e => e.status === 'failed').forEach(e => {
      const name = e.flow_name || 'Desconhecido';
      failuresByFlow[name] = (failuresByFlow[name] || 0) + 1;
    });
    const failuresByFlowData = Object.entries(failuresByFlow)
      .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, falhas: count }))
      .sort((a, b) => b.falhas - a.falhas)
      .slice(0, 8);

    // Daily trend (last 7 days)
    const dailyTrend: Record<string, { success: number; failed: number }> = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().slice(5, 10);
      dailyTrend[d] = { success: 0, failed: 0 };
    }
    executions.forEach(e => {
      const d = e.started_at.slice(5, 10);
      if (dailyTrend[d]) {
        if (e.status === 'success') dailyTrend[d].success++;
        else if (e.status === 'failed') dailyTrend[d].failed++;
      }
    });
    const trendData = Object.entries(dailyTrend).map(([date, v]) => ({ date, ...v }));

    // Status distribution for pie
    const statusDist = [
      { name: 'Sucesso', value: success },
      { name: 'Falha', value: failed },
      { name: 'Executando', value: running },
    ].filter(s => s.value > 0);

    return { total, success, failed, running, successRate, avgDuration, failuresByFlowData, trendData, statusDist };
  }, [executions]);

  if (executions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Sem dados de execução</p>
          <p className="text-xs text-muted-foreground mt-1">Execute automações para ver as métricas aqui</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Execuções</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{metrics.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{metrics.successRate}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Sucessos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{metrics.success}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{metrics.failed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{metrics.avgDuration}s</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendência de Execuções (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <LineChart data={metrics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="success" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} name="Sucesso" />
                <Line type="monotone" dataKey="failed" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} name="Falha" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <PieChart>
                <Pie data={metrics.statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {metrics.statusDist.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Failures by Flow */}
        {metrics.failuresByFlowData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Falhas por Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={metrics.failuresByFlowData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={140} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="falhas" fill="hsl(0, 84%, 60%)" name="Falhas" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
