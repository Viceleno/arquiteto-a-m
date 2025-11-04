import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Users, Activity, TrendingUp } from 'lucide-react';

type AnalyticsData = {
  event_name: string;
  event_count: number;
  unique_users: number;
  event_date: string;
};

type EventSummary = {
  name: string;
  total: number;
  uniqueUsers: number;
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data: summaryData, error: summaryError } = await supabase
          .from('analytics_events')
          .select('event_name, user_id, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        if (summaryError) throw summaryError;

        // Agrupar dados manualmente
        const grouped = (summaryData || []).reduce((acc: Record<string, AnalyticsData>, row) => {
          const date = new Date(row.created_at).toISOString().split('T')[0];
          const key = `${row.event_name}-${date}`;
          
          if (!acc[key]) {
            acc[key] = {
              event_name: row.event_name,
              event_count: 0,
              unique_users: 0,
              event_date: date,
            };
          }
          
          acc[key].event_count++;
          return acc;
        }, {});

        setData(Object.values(grouped));
      } catch (err: any) {
        setError('Erro ao buscar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const eventSummaries = data.reduce((acc: Record<string, EventSummary>, row) => {
    if (!acc[row.event_name]) {
      acc[row.event_name] = {
        name: row.event_name,
        total: 0,
        uniqueUsers: 0,
      };
    }
    acc[row.event_name].total += row.event_count;
    acc[row.event_name].uniqueUsers += row.unique_users;
    return acc;
  }, {});

  const totalEvents = data.reduce((sum, row) => sum + row.event_count, 0);
  const totalUsers = new Set(data.map(row => row.unique_users)).size;

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Dashboard de Analytics</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Eventos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(eventSummaries).length}</div>
            <p className="text-xs text-muted-foreground">Eventos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Com atividade recente</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Eventos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(eventSummaries).map((summary, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{summary.name}</TableCell>
                  <TableCell className="text-right">{summary.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Detalhados (Últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(row.event_date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{row.event_name}</TableCell>
                  <TableCell className="text-right">{row.event_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
