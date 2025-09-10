import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { CalculationDetailModal } from '@/components/CalculationDetailModal';
import { ShareCalculationModal } from '@/components/ShareCalculationModal';
import { HistorySkeleton } from '@/components/skeletons/HistorySkeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History as HistoryIcon, Search, Trash2, FileDown, FileText, Calendar, Calculator, ArrowUpDown, Eye, Share2 } from 'lucide-react';

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
  const isMobile = useMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load calculations from Supabase
  useEffect(() => {
    const fetchCalculations = async () => {
      if (!user) return;

      try {
        console.log('History: Buscando cálculos para user_id:', user.id);
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('History: Erro na query:', error);
          throw error;
        }

        console.log('History: Cálculos encontrados:', data?.length || 0);
        setCalculations(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar histórico:', error);
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

  // Função para formatar o resultado para exibição na tabela
  const formatResultDisplay = (calc: Calculation): string => {
    if (!calc.result || typeof calc.result !== 'object') {
      return 'Sem resultado';
    }

    const result = calc.result;

    // Área
    if (result.area) {
      const area = parseFloat(result.area);
      return `${area.toFixed(2)} m²`;
    }

    // Volume
    if (result.volume) {
      const volume = parseFloat(result.volume);
      return `${volume.toFixed(2)} m³`;
    }

    // Custo total com BDI
    if (result.totalCostWithBDI) {
      const cost = parseFloat(result.totalCostWithBDI);
      return `R$ ${cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    // Custo total sem BDI
    if (result.totalCost) {
      const cost = parseFloat(result.totalCost);
      return `R$ ${cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    // Materiais - mostra o primeiro material com quantidade
    if (result.materials && typeof result.materials === 'object') {
      const materials = Object.entries(result.materials);
      if (materials.length > 0) {
        const [materialName, materialData] = materials[0];
        if (typeof materialData === 'object' && materialData !== null && (materialData as any).quantity) {
          return `${(materialData as any).quantity} ${(materialData as any).unit || ''} de ${materialName}`;
        } else {
          return `${String(materialData)} ${materialName}`;
        }
      }
    }

    // Tijolos
    if (result.totalBricks) {
      return `${result.totalBricks} tijolos`;
    }

    // Sacos de cimento
    if (result.cementBags) {
      return `${result.cementBags} sacos de cimento`;
    }

    // Latas de tinta
    if (result.paintCans) {
      return `${result.paintCans} latas de tinta`;
    }

    // Se houver outros resultados numéricos, mostra o primeiro
    const numericResults = Object.entries(result).filter(([key, value]) => {
      return typeof value === 'number' || (!isNaN(parseFloat(String(value))) && isFinite(parseFloat(String(value))));
    });

    if (numericResults.length > 0) {
      const [key, value] = numericResults[0];
      const numValue = parseFloat(String(value));
      
      // Verifica se é um valor monetário
      if (key.toLowerCase().includes('cost') || key.toLowerCase().includes('custo')) {
        return `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }
      
      // Verifica se é porcentagem
      if (key.toLowerCase().includes('bdi') || key.toLowerCase().includes('margin')) {
        return `${numValue}%`;
      }
      
      return `${numValue.toFixed(2)}`;
    }

    return 'Ver detalhes';
  };

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

  const viewCalculation = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
    setIsDetailModalOpen(true);
  };

  const shareCalculation = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
    setIsShareModalOpen(true);
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

  const exportCalculationsTXT = () => {
    if (!calculations.length) return;
    
    const currentDate = new Date().toLocaleString('pt-BR');
    const userName = user?.email || 'Usuário desconhecido';
    
    let txtContent = '';
    
    // Cabeçalho
    txtContent += '═══════════════════════════════════════════════════════════════\n';
    txtContent += '                    HISTÓRICO DE CÁLCULOS - ARQUICALC\n';
    txtContent += '═══════════════════════════════════════════════════════════════\n\n';
    txtContent += `Usuário: ${userName}\n`;
    txtContent += `Data de exportação: ${currentDate}\n`;
    txtContent += `Total de cálculos: ${calculations.length}\n\n`;
    
    const uniqueTypes = new Set(calculations.map(c => c.calculator_type));
    txtContent += '───────────────────────────────────────────────────────────────\n';
    txtContent += '                        RESUMO ESTATÍSTICO\n';
    txtContent += '───────────────────────────────────────────────────────────────\n';
    txtContent += `• Tipos de calculadoras utilizadas: ${uniqueTypes.size}\n`;
    txtContent += `• Último cálculo realizado: ${calculations.length > 0 ? formatDate(calculations[0].created_at) : 'N/A'}\n\n`;
    
    txtContent += '───────────────────────────────────────────────────────────────\n';
    txtContent += '                      DETALHES DOS CÁLCULOS\n';
    txtContent += '───────────────────────────────────────────────────────────────\n\n';
    
    calculations.forEach((calc, index) => {
      txtContent += `${index + 1}. ${calc.calculator_type.toUpperCase()}\n`;
      txtContent += `   Nome: ${calc.name || 'Sem nome'}\n`;
      txtContent += `   Data: ${formatDate(calc.created_at)}\n`;
      txtContent += `   Resultado: ${formatResultDisplay(calc)}\n`;
      
      if (calc.input_data && typeof calc.input_data === 'object') {
        txtContent += `   Dados de entrada:\n`;
        Object.entries(calc.input_data).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            txtContent += `     - ${key}: ${value}\n`;
          }
        });
      }
      
      txtContent += '\n';
      if (index < calculations.length - 1) {
        txtContent += '   ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n\n';
      }
    });
    
    txtContent += '\n═══════════════════════════════════════════════════════════════\n';
    txtContent += '              Arquivo gerado pelo ArquiCalc\n';
    txtContent += '          Sistema de Cálculos para Arquitetura\n';
    txtContent += '═══════════════════════════════════════════════════════════════\n';
    
    const dataBlob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico_calculos_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportação concluída',
      description: 'Seus dados foram exportados em formato TXT com layout organizado.',
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

  // Prevent flash of empty data - show skeleton while loading
  if (loading || (user && isLoading)) {
    return <HistorySkeleton />;
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Histórico de Cálculos
              </h1>
              <p className="text-gray-600 text-base lg:text-lg">
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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <CardTitle className="text-xl font-bold text-gray-900">Seus Cálculos</CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
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
                    onClick={exportCalculationsTXT} 
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
              <div className="text-center py-12 lg:py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 lg:w-10 lg:h-10 text-gray-300" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                  {calculations.length > 0 ? 'Nenhum resultado encontrado' : 'Nenhum cálculo encontrado'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto px-4">
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
                {isMobile ? (
                  // Mobile card view
                  <div className="p-4 space-y-3">
                    {filteredCalculations.map((calc) => (
                      <Card key={calc.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {getCalculatorTypeIcon(calc.calculator_type)}
                              {getCalculatorTypeBadge(calc.calculator_type)}
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => viewCalculation(calc)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => shareCalculation(calc)}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteCalculation(calc.id)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-gray-500">Nome</div>
                              <div className="font-medium text-gray-900 truncate">{calc.name || '-'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Resultado</div>
                              <div className="font-medium text-gray-900">{formatResultDisplay(calc)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Data</div>
                              <div className="text-sm text-gray-600">{formatDate(calc.created_at)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Desktop table view
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
                      {filteredCalculations.map((calc) => (
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
                            {formatResultDisplay(calc)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => viewCalculation(calc)}
                                className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => shareCalculation(calc)}
                                className="hover:bg-green-50 hover:text-green-600 transition-colors"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteCalculation(calc.id)}
                                className="hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CalculationDetailModal
        calculation={selectedCalculation}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCalculation(null);
        }}
      />

      <ShareCalculationModal
        calculationId={selectedCalculation?.id || null}
        calculationName={selectedCalculation?.name || 'Cálculo sem nome'}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedCalculation(null);
        }}
      />
    </ResponsiveLayout>
  );
};

export default History;
