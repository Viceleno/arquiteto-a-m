import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Activity, TrendingUp, Calculator, Share2, Save, ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type AnalyticsEvent = {
  id: string;
  event_name: string;
  user_id: string | null;
  created_at: string;
  event_data: any;
};

type EventSummary = {
  name: string;
  total: number;
  uniqueUsers: number;
};

type DailyData = {
  date: string;
  calculation_completed: number;
  calculation_saved: number;
  calculation_shared: number;
};

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data: eventsData, error: eventsError } = await supabase
          .from('analytics_events')
          .select('*')
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;
        setEvents(eventsData || []);
      } catch (err: any) {
        setError('Erro ao buscar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Calcular métricas
  const eventSummaries = events.reduce((acc: Record<string, EventSummary>, event) => {
    if (!acc[event.event_name]) {
      acc[event.event_name] = {
        name: event.event_name,
        total: 0,
        uniqueUsers: 0,
      };
    }
    acc[event.event_name].total++;
    return acc;
  }, {});

  // Calcular usuários únicos por evento
  Object.keys(eventSummaries).forEach(eventName => {
    const uniqueUserIds = new Set(
      events
        .filter(e => e.event_name === eventName && e.user_id)
        .map(e => e.user_id)
    );
    eventSummaries[eventName].uniqueUsers = uniqueUserIds.size;
  });

  const totalEvents = events.length;
  const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;

  // Preparar dados para o gráfico diário
  const dailyData: Record<string, DailyData> = {};
  events.forEach(event => {
    const date = new Date(event.created_at).toLocaleDateString('pt-BR');
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        calculation_completed: 0,
        calculation_saved: 0,
        calculation_shared: 0,
      };
    }
    if (event.event_name === 'calculation_completed') dailyData[date].calculation_completed++;
    if (event.event_name === 'calculation_saved') dailyData[date].calculation_saved++;
    if (event.event_name === 'calculation_shared') dailyData[date].calculation_shared++;
  });

  const chartData = Object.values(dailyData).reverse().slice(-14); // Últimos 14 dias

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

  const eventLabels: Record<string, { label: string; icon: any }> = {
    calculation_completed: { label: 'Cálculos Concluídos', icon: Calculator },
    calculation_saved: { label: 'Cálculos Salvos', icon: Save },
    calculation_shared: { label: 'Cálculos Compartilhados', icon: Share2 },
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard de Analytics</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="p-6 bg-muted rounded-full">
              <BarChart3 className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Nenhum dado disponível ainda</h3>
              <p className="text-muted-foreground max-w-md">
                Os dados de analytics serão exibidos aqui assim que os usuários começarem a usar as calculadoras.
                Experimente fazer alguns cálculos para ver os dados aparecerem!
              </p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
              <Calculator className="w-4 h-4" />
              Ir para Calculadoras
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Com atividade recente</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Diária (Últimos 14 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calculation_completed" name="Concluídos" fill="hsl(var(--primary))" />
                <Bar dataKey="calculation_saved" name="Salvos" fill="hsl(var(--chart-2))" />
                <Bar dataKey="calculation_shared" name="Compartilhados" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

          {Object.values(eventSummaries).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Eventos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(eventSummaries).map((summary, index) => {
                    const eventInfo = eventLabels[summary.name] || { label: summary.name, icon: Activity };
                    const Icon = eventInfo.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{eventInfo.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {summary.uniqueUsers} usuário{summary.uniqueUsers !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{summary.total}</p>
                          <p className="text-xs text-muted-foreground">eventos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Eventos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Usuário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.slice(0, 50).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-sm">
                          {new Date(event.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {eventLabels[event.event_name]?.label || event.event_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {event.user_id ? event.user_id.substring(0, 8) + '...' : 'Anônimo'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
