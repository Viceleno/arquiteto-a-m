
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History as HistoryIcon, Search, Trash2, FileDown, FileText } from 'lucide-react';

interface Calculation {
  id: string;
  calculator_type: string;
  name: string | null;
  created_at: string;
  result: any;
  input_data: any;
}

const History = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load calculations
  useEffect(() => {
    const fetchCalculations = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setCalculations(data || []);
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar histórico',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCalculations();
    }
  }, [user, toast]);

  const deleteCalculation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCalculations((prev) => prev.filter(calc => calc.id !== id));
      
      toast({
        title: 'Cálculo excluído',
        description: 'O registro foi removido com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const exportCalculations = () => {
    try {
      const dataStr = JSON.stringify(calculations, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'historico_calculos_arquitetura.json';
      link.click();
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCalculations = calculations.filter(calc => 
    calc.calculator_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (calc.name && calc.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Prevent flash of empty data
  if (loading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <HistoryIcon />
                <span>Histórico de Cálculos</span>
              </h1>
              <p className="text-gray-600">
                Acesse todos os seus cálculos anteriores
              </p>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Histórico</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Pesquisar cálculos..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportCalculations} title="Exportar histórico">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCalculations.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-1">Nenhum cálculo encontrado</p>
                    <p className="text-sm text-gray-400">
                      {calculations.length > 0 
                        ? 'Tente uma pesquisa diferente' 
                        : 'Seus cálculos aparecerão aqui automaticamente'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCalculations.map((calc) => {
                          // Format the result for display
                          let resultDisplay = '';
                          if (calc.result && typeof calc.result === 'object') {
                            if (calc.result.area) {
                              resultDisplay = `Área: ${parseFloat(calc.result.area).toFixed(2)} ${calc.result.unit || 'm²'}`;
                            } else if (calc.result.volume) {
                              resultDisplay = `Volume: ${parseFloat(calc.result.volume).toFixed(2)} ${calc.result.unit || 'm³'}`;
                            } else if (calc.result.totalBricks) {
                              resultDisplay = `${calc.result.totalBricks} tijolos`;
                            } else if (calc.result.cementBags) {
                              resultDisplay = `${calc.result.cementBags} sacos de cimento`;
                            } else {
                              resultDisplay = 'Ver detalhes';
                            }
                          }
                          
                          return (
                            <TableRow key={calc.id}>
                              <TableCell className="font-medium">{calc.calculator_type}</TableCell>
                              <TableCell>{calc.name || '-'}</TableCell>
                              <TableCell>{formatDate(calc.created_at)}</TableCell>
                              <TableCell>{resultDisplay}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteCalculation(calc.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default History;
