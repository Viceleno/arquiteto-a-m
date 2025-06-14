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
import { Badge } from '@/components/ui/badge';
import { History as HistoryIcon, Search, Trash2, FileDown, FileText, Calendar, Calculator, ArrowUpDown } from 'lucide-react';

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
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const exportCalculationsJSON = () => {
    if (!calculations.length) return;
    
    const exportData = calculations.map(calc => ({
      tipo: calc.calculator_type,
      nome: calc.name || '-',
      data: formatDate(calc.created_at),
      resultado: calc.result,
      dados_entrada: calc.input_data
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico_calculos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportação concluída',
      description: 'Seus dados foram exportados em formato JSON.',
    });
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

  const getCalculatorTypeIcon = (type: string) => {
    if (type.includes('Área')) return <Calculator className="w-4 h-4 text-blue-600" />;
    if (type.includes('Material')) return <Calculator className="w-4 h-4 text-orange-600" />;
    if (type.includes('Custo')) return <Calculator className="w-4 h-4 text-green-600" />;
    return <Calculator className="w-4 h-4 text-gray-600" />;
  };

  const getCalculatorTypeBadge = (type: string) => {
    if (type.includes('Área')) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Área</Badge>;
    if (type.includes('Material')) return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Material</Badge>;
    if (type.includes('Custo')) return <Badge variant="secondary" className="bg-green-100 text-green-800">Custo</Badge>;
    return <Badge variant="outline">{type}</Badge>;
  };

  const sortCalculations = (calcs: Calculation[]) => {
    return [...calcs].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'type':
          compareValue = a.calculator_type.localeCompare(b.calculator_type);
          break;
        case 'name':
          compareValue = (a.name || '').localeCompare(b.name || '');
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  };

  const filteredCalculations = sortCalculations(
    calculations.filter(calc => 
      calc.calculator_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (calc.name && calc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Prevent flash of empty data
  if (loading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <HistoryIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Histórico de Cálculos
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Acesse e gerencie todos os seus cálculos anteriores
                  </p>
                </div>
              </div>
              
              {calculations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calculator className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{calculations.length}</div>
                          <div className="text-sm text-gray-600">Cálculos realizados</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {calculations.length > 0 ? formatDate(calculations[0].created_at).split(' ')[0] : '-'}
                          </div>
                          <div className="text-sm text-gray-600">Último cálculo</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {new Set(calculations.map(c => c.calculator_type)).size}
                          </div>
                          <div className="text-sm text-gray-600">Tipos diferentes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <CardTitle className="text-xl font-bold text-gray-900">Seus Cálculos</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Pesquisar cálculos..."
                        className="pl-10 w-full sm:w-[250px] bg-white/70 border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="bg-white/70 border-gray-200"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportCalculationsJSON} 
                        className="bg-white/70 border-gray-200"
                        disabled={calculations.length === 0}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredCalculations.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {calculations.length > 0 ? 'Nenhum resultado encontrado' : 'Nenhum cálculo encontrado'}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {calculations.length > 0 
                        ? 'Tente uma pesquisa diferente ou limpe os filtros para ver todos os cálculos' 
                        : 'Seus cálculos aparecerão aqui automaticamente quando você usar nossas calculadoras'}
                    </p>
                    {calculations.length === 0 && (
                      <Button onClick={() => navigate('/calculators')} className="bg-blue-600 hover:bg-blue-700">
                        <Calculator className="w-4 h-4 mr-2" />
                        Fazer primeiro cálculo
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-100">
                          <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                          <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                          <TableHead className="font-semibold text-gray-700">Data</TableHead>
                          <TableHead className="font-semibold text-gray-700">Resultado</TableHead>
                          <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCalculations.map((calc) => {
                          // Format the result for display
                          let resultDisplay = '';
                          if (calc.result && typeof calc.result === 'object') {
                            if (calc.result.area) {
                              resultDisplay = `${parseFloat(calc.result.area).toFixed(2)} ${calc.result.unit || 'm²'}`;
                            } else if (calc.result.volume) {
                              resultDisplay = `${parseFloat(calc.result.volume).toFixed(2)} ${calc.result.unit || 'm³'}`;
                            } else if (calc.result.totalBricks) {
                              resultDisplay = `${calc.result.totalBricks} tijolos`;
                            } else if (calc.result.cementBags) {
                              resultDisplay = `${calc.result.cementBags} sacos`;
                            } else if (calc.result.totalCostWithBDI) {
                              resultDisplay = `R$ ${parseFloat(calc.result.totalCostWithBDI).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                            } else {
                              resultDisplay = 'Ver detalhes';
                            }
                          }
                          
                          return (
                            <TableRow key={calc.id} className="hover:bg-blue-50/50 transition-colors border-gray-100">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  {getCalculatorTypeIcon(calc.calculator_type)}
                                  {getCalculatorTypeBadge(calc.calculator_type)}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {calc.name || '-'}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatDate(calc.created_at)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {resultDisplay}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteCalculation(calc.id)}
                                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
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
