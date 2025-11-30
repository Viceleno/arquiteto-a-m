import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Calculator,
  Eye,
  Trash2,
} from 'lucide-react';
import { CalculationDetailModal } from '@/components/CalculationDetailModal';

interface Project {
  id: string;
  name: string;
  client_name: string | null;
  address: string | null;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Calculation {
  id: string;
  calculator_type: string;
  name: string | null;
  created_at: string;
  result: any;
  input_data: any;
}

interface MaterialSummary {
  name: string;
  totalQuantity: number;
  unit: string;
  totalCost: number;
  occurrences: number;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchProject();
      fetchCalculations();
    }
  }, [user, id]);

  const fetchProject = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error('Erro ao carregar projeto:', error);
      toast({
        title: 'Erro ao carregar projeto',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/projects');
    }
  };

  const fetchCalculations = async () => {
    if (!user || !id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalculations(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cálculos:', error);
      toast({
        title: 'Erro ao carregar cálculos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCalculation = async (calculationId: string) => {
    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', calculationId);

      if (error) throw error;

      toast({
        title: 'Cálculo excluído',
        description: 'O cálculo foi removido do projeto.',
      });

      fetchCalculations();
    } catch (error: any) {
      console.error('Erro ao excluir cálculo:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Calcular totais consolidados
  const calculateTotals = () => {
    let totalCost = 0;
    const materialsMap: Record<string, MaterialSummary> = {};

    calculations.forEach((calc) => {
      const result = calc.result || {};

      // Extrair custos
      if (result.totalCostWithBDI) {
        totalCost += parseFloat(result.totalCostWithBDI) || 0;
      } else if (result.totalCost) {
        totalCost += parseFloat(result.totalCost) || 0;
      }

      // Extrair materiais
      if (result.materialDetails && Array.isArray(result.materialDetails)) {
        result.materialDetails.forEach((material: any) => {
          const key = `${material.name}_${material.unit}`;
          if (!materialsMap[key]) {
            materialsMap[key] = {
              name: material.name,
              totalQuantity: 0,
              unit: material.unit,
              totalCost: 0,
              occurrences: 0,
            };
          }
          materialsMap[key].totalQuantity += parseFloat(material.quantity) || 0;
          materialsMap[key].totalCost += parseFloat(material.total) || 0;
          materialsMap[key].occurrences += 1;
        });
      }

      // Extrair materiais do formato simples (result.materials)
      if (result.materials && typeof result.materials === 'object') {
        Object.entries(result.materials).forEach(([name, data]: [string, any]) => {
          if (data && typeof data === 'object') {
            const quantity = parseFloat(data.quantity || data.value || 0);
            const unit = data.unit || '';
            const key = `${name}_${unit}`;

            if (!materialsMap[key]) {
              materialsMap[key] = {
                name,
                totalQuantity: 0,
                unit,
                totalCost: 0,
                occurrences: 0,
              };
            }
            materialsMap[key].totalQuantity += quantity;
            materialsMap[key].occurrences += 1;
          }
        });
      }
    });

    return {
      totalCost,
      materials: Object.values(materialsMap).sort((a, b) => b.totalQuantity - a.totalQuantity),
    };
  };

  const { totalCost, materials } = calculateTotals();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatResultDisplay = (calc: Calculation): string => {
    const result = calc.result || {};
    if (result.totalCostWithBDI) {
      return `R$ ${parseFloat(result.totalCostWithBDI).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (result.totalCost) {
      return `R$ ${parseFloat(result.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (result.area) {
      return `${parseFloat(result.area).toFixed(2)} m²`;
    }
    if (result.volume) {
      return `${parseFloat(result.volume).toFixed(2)} m³`;
    }
    return 'Ver detalhes';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Ativo' },
      completed: { variant: 'secondary', label: 'Concluído' },
      archived: { variant: 'outline', label: 'Arquivado' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || isLoading || !project) {
    return (
      <ResponsiveLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando projeto...</p>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Projetos
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {project.name}
                </h1>
                {getStatusBadge(project.status)}
              </div>
              <div className="space-y-2 text-gray-600">
                {project.client_name && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{project.client_name}</span>
                  </div>
                )}
                {project.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {formatDate(project.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Custo Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Materiais Únicos</p>
                  <p className="text-2xl font-bold text-green-900">{materials.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Cálculos</p>
                  <p className="text-2xl font-bold text-purple-900">{calculations.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Summary */}
        {materials.length > 0 && (
          <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-gray-900">Resumo de Materiais</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Quantidade Total</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                      <TableHead className="text-right">Ocorrências</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell className="text-right">
                          {material.totalQuantity.toFixed(3)} {material.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {material.totalCost > 0
                            ? `R$ ${material.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">{material.occurrences}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculations List */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-gray-900">Cálculos do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {calculations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum cálculo vinculado
                </h3>
                <p className="text-gray-500 mb-6">
                  Os cálculos salvos neste projeto aparecerão aqui
                </p>
                <Button
                  onClick={() => navigate('/calculators')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Criar Cálculo
                </Button>
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
                    {calculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell>
                          <Badge variant="secondary">{calc.calculator_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {calc.name || '-'}
                        </TableCell>
                        <TableCell>{formatDate(calc.created_at)}</TableCell>
                        <TableCell>{formatResultDisplay(calc)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCalculation(calc);
                                setIsDetailModalOpen(true);
                              }}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCalculation(calc.id)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
    </ResponsiveLayout>
  );
};

export default ProjectDetails;

