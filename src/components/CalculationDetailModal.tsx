
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Calendar, User, FileText, Download, Share2, FileDown } from 'lucide-react';
import { ShareCalculationModal } from '@/components/ShareCalculationModal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Calculation {
  id: string;
  calculator_type: string;
  name: string | null;
  created_at: string;
  result: any;
  input_data: any;
}

interface CalculationDetailModalProps {
  calculation: Calculation | null;
  isOpen: boolean;
  onClose: () => void;
  showShareButton?: boolean;
}

export const CalculationDetailModal: React.FC<CalculationDetailModalProps> = ({
  calculation,
  isOpen,
  onClose,
  showShareButton = true,
}) => {
  const [showShareModal, setShowShareModal] = React.useState(false);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ company?: string; full_name?: string } | null>(null);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('company, full_name')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };
    
    if (user) {
      loadUserProfile();
    }
  }, [user]);
  
  if (!calculation) return null;

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
    if (type.includes('Área')) return <Calculator className="w-5 h-5 text-blue-600" />;
    if (type.includes('Material')) return <Calculator className="w-5 h-5 text-orange-600" />;
    if (type.includes('Custo')) return <Calculator className="w-5 h-5 text-green-600" />;
    return <Calculator className="w-5 h-5 text-gray-600" />;
  };

  const getCalculatorTypeBadge = (type: string) => {
    if (type.includes('Área')) return <Badge className="bg-blue-100 text-blue-800">Área</Badge>;
    if (type.includes('Material')) return <Badge className="bg-orange-100 text-orange-800">Material</Badge>;
    if (type.includes('Custo')) return <Badge className="bg-green-100 text-green-800">Custo</Badge>;
    return <Badge variant="outline">{type}</Badge>;
  };

  const formatInputLabel = (key: string) => {
    const labelMap: { [key: string]: string } = {
      length: 'Comprimento',
      width: 'Largura',
      height: 'Altura',
      diameter: 'Diâmetro',
      radius: 'Raio',
      thickness: 'Espessura',
      area: 'Área',
      rooms: 'Número de Cômodos',
      windows: 'Número de Janelas',
      doors: 'Número de Portas',
      wallHeight: 'Altura da Parede',
      wallLength: 'Comprimento da Parede',
      brickType: 'Tipo de Tijolo',
      mortarType: 'Tipo de Argamassa',
      cementType: 'Tipo de Cimento',
      flooringType: 'Tipo de Piso',
      paintType: 'Tipo de Tinta',
      roofType: 'Tipo de Telhado',
      tileType: 'Tipo de Telha',
      slope: 'Inclinação',
      roofPlanes: 'Número de Águas',
      fixtureType: 'Tipo de Luminária',
      fixtureWattage: 'Potência',
      ambientType: 'Tipo de Ambiente',
      ceilingHeight: 'Altura do Teto',
      quantity: 'Quantidade',
      unitCost: 'Custo Unitário',
      laborCost: 'Custo de Mão de Obra',
      bdi: 'BDI',
      margin: 'Margem',
      materialType: 'Tipo de Material',
      calculationType: 'Tipo de Cálculo',
      material: 'Material',
      complexity: 'Complexidade',
      fck: 'FCK do Concreto',
      coats: 'Demãos',
      tileSize: 'Tamanho do Azulejo',
      woodType: 'Tipo de Madeira',
      brickSize: 'Tamanho do Tijolo'
    };
    
    return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatInputValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    
    // Valores monetários
    if (key.toLowerCase().includes('cost') || key.toLowerCase().includes('custo')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }
    }
    
    // Porcentagens
    if (key.toLowerCase().includes('bdi') || key.toLowerCase().includes('margin') || key.toLowerCase().includes('margem')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `${numValue}%`;
      }
    }
    
    // Medidas
    if (['length', 'width', 'height', 'diameter', 'radius', 'thickness', 'wallHeight', 'wallLength'].includes(key)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `${numValue} m`;
      }
    }
    
    // Área
    if (key === 'area') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `${numValue} m²`;
      }
    }
    
    return String(value);
  };

  const renderInputData = () => {
    if (!calculation.input_data || typeof calculation.input_data !== 'object') {
      return <p className="text-gray-500">Dados de entrada não disponíveis</p>;
    }

    return (
      <div className="space-y-3">
        {Object.entries(calculation.input_data).map(([key, value]) => {
          if (value === null || value === undefined || value === '') return null;
          
          return (
            <div key={key} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-gray-700">
                {formatInputLabel(key)}:
              </span>
              <span className="text-gray-900 font-semibold">{formatInputValue(key, value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResultData = () => {
    if (!calculation.result || typeof calculation.result !== 'object') {
      return <p className="text-gray-500">Resultado não disponível</p>;
    }

    return (
      <div className="space-y-4">
        {/* Área Calculada */}
        {calculation.result.area && !isNaN(parseFloat(calculation.result.area)) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Área Total</h4>
            <p className="text-2xl font-bold text-blue-800">
              {parseFloat(calculation.result.area).toFixed(2)} m²
            </p>
          </div>
        )}

        {/* Volume Calculado */}
        {calculation.result.volume && !isNaN(parseFloat(calculation.result.volume)) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Volume Total</h4>
            <p className="text-2xl font-bold text-blue-800">
              {parseFloat(calculation.result.volume).toFixed(2)} m³
            </p>
          </div>
        )}

        {/* Custo Total com BDI */}
        {calculation.result.totalCostWithBDI && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Custo Total com BDI</h4>
            <p className="text-2xl font-bold text-green-800">
              R$ {parseFloat(calculation.result.totalCostWithBDI).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Custo Total sem BDI */}
        {calculation.result.totalCost && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Custo Total</h4>
            <p className="text-xl font-bold text-gray-800">
              R$ {parseFloat(calculation.result.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Detalhes dos Materiais - Nova estrutura com materialDetails */}
        {calculation.result.materialDetails && Array.isArray(calculation.result.materialDetails) && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-3">Detalhamento de Materiais</h4>
            <div className="space-y-4">
              {/* Resumo por categoria */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded">
                  <h5 className="font-semibold text-blue-900 text-sm">Total de Materiais</h5>
                  <p className="text-xl font-bold text-blue-800">
                    R$ {(calculation.result.materialTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded">
                  <h5 className="font-semibold text-green-900 text-sm">Mão de Obra</h5>
                  <p className="text-xl font-bold text-green-800">
                    R$ {(calculation.result.laborTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <h5 className="font-semibold text-gray-900 text-sm">Custo por m²</h5>
                  <p className="text-xl font-bold text-gray-800">
                    R$ {(calculation.result.costPerM2 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Lista detalhada de materiais */}
              <div className="space-y-3">
                {calculation.result.materialDetails.map((item: any, index: number) => (
                  <div key={index} className="bg-white border border-orange-200 rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h6 className="font-semibold text-gray-900">{item.name}</h6>
                           <div className="text-xs text-gray-500 mt-1">
                            {item.category === 'material' ? '🧱 Material Principal' : 
                             item.category === 'auxiliary' ? '🔧 Material Auxiliar' : '📋 Item'}
                          </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                       <div>
                        <span className="text-gray-600">Quantidade:</span>
                        <div className="font-semibold">{item.quantity.toLocaleString('pt-BR')} {item.unit}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Preço Unitário:</span>
                        <div className="font-semibold">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="bg-gray-100 rounded p-2">
                          <div className="text-xs text-gray-600">Cálculo:</div>
                          <div className="font-mono text-xs">
                            {item.quantity.toLocaleString('pt-BR')} × R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resultados de MaterialCalculator - Estrutura MaterialResult */}
        {(() => {
          // Verifica se é um resultado de MaterialCalculator (formato MaterialResult)
          const materialResultEntries = Object.entries(calculation.result).filter(([key, value]) => {
            return value && typeof value === 'object' && 'value' in value && 'unit' in value && 'category' in value;
          });

          if (materialResultEntries.length > 0) {
            // Agrupa por categoria
            const primaryItems = materialResultEntries.filter(([_, val]: [string, any]) => val.category === 'primary');
            const secondaryItems = materialResultEntries.filter(([_, val]: [string, any]) => val.category === 'secondary');
            const infoItems = materialResultEntries.filter(([_, val]: [string, any]) => val.category === 'info');

            return (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-3">Materiais e Quantitativos</h4>
                <div className="space-y-4">
                  {/* Informações gerais */}
                  {infoItems.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">📋 Informações Gerais</h5>
                      {infoItems.map(([key, data]: [string, any]) => (
                        <div key={key} className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex justify-between items-center">
                           <span className="text-sm text-blue-900 font-medium capitalize">
                              {formatInputLabel(key)}:
                            </span>
                            <span className={`font-bold text-lg ${data.highlight ? 'text-blue-700' : 'text-blue-600'}`}>
                              {data.value} {data.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Materiais principais */}
                  {primaryItems.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">🧱 Materiais Principais</h5>
                      {primaryItems.map(([key, data]: [string, any]) => (
                        <div key={key} className="bg-white border border-orange-300 rounded p-3 shadow-sm">
                          <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-700 font-medium capitalize">
                              {formatInputLabel(key)}:
                            </span>
                            <span className={`font-bold text-lg ${data.highlight ? 'text-orange-700' : 'text-orange-600'}`}>
                              {data.value} {data.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Materiais secundários/auxiliares */}
                  {secondaryItems.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">🔧 Materiais Auxiliares</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {secondaryItems.map(([key, data]: [string, any]) => (
                          <div key={key} className="bg-gray-50 border border-gray-300 rounded p-2">
                            <div className="flex flex-col">
                             <span className="text-xs text-gray-600 capitalize">
                                {formatInputLabel(key)}
                              </span>
                              <span className="font-semibold text-gray-800">
                                {data.value} {data.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Materiais Necessários - Estrutura antiga (fallback) */}
        {!calculation.result.materialDetails && calculation.result.materials && Object.keys(calculation.result.materials).length > 0 && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-3">Materiais Necessários</h4>
            <div className="space-y-2">
              {Object.entries<any>(calculation.result.materials).map(([material, data]) => {
                if (typeof data === 'object' && data !== null) {
                  return (
                    <div key={material} className="border-b pb-2 last:border-b-0">
                      <div className="font-medium text-orange-800 capitalize mb-1">{material}:</div>
                      <div className="ml-2 space-y-1">
                        {data.quantity && (
                          <div className="text-sm text-orange-700">
                            Quantidade: <span className="font-semibold">{data.quantity} {data.unit || ''}</span>
                          </div>
                        )}
                        {data.cost && (
                          <div className="text-sm text-orange-700">
                            Custo: <span className="font-semibold">R$ {parseFloat(data.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={material} className="flex justify-between items-center">
                      <span className="text-orange-800 capitalize">{material}:</span>
                      <span className="font-semibold text-orange-900">{String(data)}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Resultados específicos para diferentes tipos de cálculo */}
        {calculation.result.totalBricks && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Tijolos Necessários</h4>
            <p className="text-xl font-bold text-red-800">
              {calculation.result.totalBricks} unidades
            </p>
          </div>
        )}

        {calculation.result.cementBags && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Sacos de Cimento</h4>
            <p className="text-xl font-bold text-gray-800">
              {calculation.result.cementBags} sacos
            </p>
          </div>
        )}

        {calculation.result.paintCans && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Latas de Tinta</h4>
            <p className="text-xl font-bold text-yellow-800">
              {calculation.result.paintCans} latas
            </p>
          </div>
        )}

         {/* Outros resultados detalhados */}
        {Object.entries(calculation.result).map(([key, value]) => {
          // Ignora campos já exibidos ou campos internos
          const excludedFields = [
            'area', 'volume', 'totalCostWithBDI', 'totalCost', 'materials', 'materialDetails',
            'totalBricks', 'cementBags', 'paintCans', 'materialTotal', 'laborTotal', 
            'subtotal', 'bdiAmount', 'costPerM2'
          ];
          
          if (excludedFields.includes(key) || value === null || value === undefined) return null;

          // Ignora se for um MaterialResult (já tratado acima)
          if (value && typeof value === 'object' && 'value' in value && 'unit' in value && 'category' in value) {
            return null;
          }

          const isNumeric = !isNaN(Number(value));
          const isCost = key.toLowerCase().includes('cost') || key.toLowerCase().includes('custo');
          const isPercentage = key.toLowerCase().includes('bdi') || key.toLowerCase().includes('margin');

          let displayValue = String(value);
          if (isNumeric) {
            const numValue = parseFloat(String(value));
            if (isCost) {
              displayValue = `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            } else if (isPercentage) {
              displayValue = `${numValue}%`;
            } else {
              displayValue = numValue.toFixed(2);
            }
          }

          // Traduz valores específicos
          if (key === 'complexity') {
            displayValue = displayValue === 'simple' ? 'Simples' : displayValue === 'complex' ? 'Complexa' : displayValue;
          }

          return (
            <div key={key} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-gray-700 capitalize">
                {formatInputLabel(key)}:
              </span>
              <span className="text-gray-900 font-semibold">{displayValue}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const exportCalculation = () => {
    const exportData = {
      nome: calculation.name || 'Cálculo sem nome',
      tipo: calculation.calculator_type,
      data: formatDate(calculation.created_at),
      dados_entrada: calculation.input_data,
      resultado: calculation.result
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculo_${calculation.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Função para calcular Curva ABC dos materiais
  const calculateABCCurve = (materialDetails: any[]) => {
    if (!materialDetails || materialDetails.length === 0) return [];
    
    // Ordenar materiais do mais caro para o mais barato
    const sorted = [...materialDetails].sort((a, b) => b.total - a.total);
    
    // Calcular total
    const totalCost = sorted.reduce((sum, item) => sum + item.total, 0);
    
    // Calcular percentual acumulado
    let cumulative = 0;
    return sorted.map((item, index) => {
      const percentage = (item.total / totalCost) * 100;
      cumulative += percentage;
      
      return {
        ...item,
        percentage,
        cumulativePercentage: cumulative,
        classification: cumulative <= 80 ? 'A' : cumulative <= 95 ? 'B' : 'C',
        rank: index + 1
      };
    });
  };

  // Função para obter notas técnicas baseadas no tipo de cálculo
  const getTechnicalNotes = (calculatorType: string, inputData: any, result: any): string[] => {
    const notes: string[] = [];
    
    if (calculatorType.includes('Custo') || calculatorType.includes('Estimativa')) {
      notes.push('• Os preços utilizados são referências de mercado e podem variar conforme região e fornecedor.');
      notes.push('• O BDI (Benefícios e Despesas Indiretas) de 20% segue recomendações do SINAPI para obras públicas.');
      notes.push('• Para obras privadas, o BDI pode variar entre 15% e 30% conforme complexidade e margem desejada.');
      
      if (inputData?.complexity) {
        const complexity = inputData.complexity;
        if (complexity === 'complex') {
          notes.push('• Obra classificada como COMPLEXA: tempo de execução pode ser 80% superior ao padrão.');
        } else if (complexity === 'simple') {
          notes.push('• Obra classificada como SIMPLES: execução mais rápida e menor necessidade de mão de obra especializada.');
        }
      }
    }
    
    if (calculatorType.includes('Material') || calculatorType.includes('Concreto')) {
      notes.push('• As quantidades calculadas já incluem margem de segurança para perdas e desperdícios (5-10%).');
      notes.push('• Recomenda-se adicionar 10% extra para materiais críticos ou obras com maior complexidade.');
      
      if (inputData?.concreteType || result?.concreteType) {
        const concreteType = inputData?.concreteType || result?.concreteType?.value;
        if (concreteType?.includes('FCK 20')) {
          notes.push('• FCK 20 MPa - Traço 1:2,5:3,5 (280kg cimento/m³): Recomendado para uso residencial leve.');
        } else if (concreteType?.includes('FCK 25')) {
          notes.push('• FCK 25 MPa - Traço 1:2:3 (350kg cimento/m³): Uso geral, adequado para a maioria das aplicações.');
        } else if (concreteType?.includes('FCK 30')) {
          notes.push('• FCK 30 MPa - Traço 1:1,5:2,5 (420kg cimento/m³): Estrutural, alta resistência.');
        }
        
        notes.push('• Cura úmida: Mínimo de 7 dias para atingir resistência adequada. Manter superfície úmida constantemente.');
        notes.push('• Slump test: Controla a trabalhabilidade do concreto fresco. Valores típicos: 8-12cm para lajes.');
        notes.push('• Armadura CA-50: 80-100kg/m³ conforme espessura da laje e carregamento.');
      }
    }
    
    if (calculatorType.includes('Área')) {
      notes.push('• Os cálculos seguem a NBR 12721 (ABNT) para medição de áreas em edificações.');
      notes.push('• Para áreas irregulares, divida em formas geométricas simples e some os resultados.');
      notes.push('• Considere desníveis e irregularidades do terreno para cálculos de volume precisos.');
    }
    
    if (inputData?.material) {
      const material = inputData.material;
      if (material.includes('Alvenaria') || material.includes('Tijolo')) {
        notes.push('• Tijolos cerâmicos: Dimensões padrão 14x19x29cm (6 furos) ou 9x19x19cm (macico).');
        notes.push('• Argamassa de assentamento: Traço recomendado 1:2:8 (cimento:cal:areia) ou 1:6 (cimento:areia).');
        notes.push('• Espessura ideal da junta: 10-15mm. Adicione cal hidratada para melhor trabalhabilidade.');
      }
      
      if (material.includes('Revestimento') || material.includes('Cerâmica')) {
        notes.push('• Argamassa colante: Rendimento ~4-5kg/m² com desempenadeira dentada 8x8mm.');
        notes.push('• Tempo em aberto: 15-20 minutos após aplicação.');
        notes.push('• Rejunte: Largura da junta 2-3mm (cerâmicas retificadas) ou 3-5mm (convencionais).');
      }
    }
    
    // Nota geral
    notes.push('• Este relatório foi gerado automaticamente pelo sistema ArqCalc.');
    notes.push('• Recomenda-se revisão técnica por profissional habilitado antes da execução.');
    notes.push('• Os valores são estimativas e podem variar conforme condições locais e especificações do projeto.');
    
    return notes;
  };

  const exportToPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Cores profissionais tipo planilha de engenharia
    const primaryColor: [number, number, number] = [31, 41, 55]; // Gray-800 (mais profissional)
    const secondaryColor: [number, number, number] = [107, 114, 128]; // Gray-500
    const accentColor: [number, number, number] = [37, 99, 235]; // Blue-600
    const highlightColor: [number, number, number] = [34, 197, 94]; // Green-500
    const warningColor: [number, number, number] = [249, 115, 22]; // Orange-500
    
    // ========== CABEÇALHO PROFISSIONAL ==========
    // Linha superior
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(10, 10, pageWidth - 10, 10);
    
    // Espaço para logo da empresa (esquerda)
    const logoAreaX = 15;
    const logoAreaY = 12;
    const logoAreaWidth = 30;
    const logoAreaHeight = 15;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(logoAreaX, logoAreaY, logoAreaWidth, logoAreaHeight, 'S');
    
    // Texto "LOGO" ou nome da empresa
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    const companyName = userProfile?.company || 'LOGO DA EMPRESA';
    const companyLines = doc.splitTextToSize(companyName, logoAreaWidth - 2);
    doc.text(companyLines, logoAreaX + logoAreaWidth / 2, logoAreaY + logoAreaHeight / 2, { align: 'center', baseline: 'middle' });
    
    // Título principal (centro)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('RELATÓRIO TÉCNICO DE CÁLCULO', pageWidth / 2, logoAreaY + 5, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(calculation.calculator_type.toUpperCase(), pageWidth / 2, logoAreaY + 10, { align: 'center' });
    
    // Informações do documento (direita)
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`ID: ${calculation.id.slice(0, 8).toUpperCase()}`, pageWidth - 15, logoAreaY + 3, { align: 'right' });
    doc.text(`Data: ${formatDate(calculation.created_at)}`, pageWidth - 15, logoAreaY + 7, { align: 'right' });
    if (userProfile?.full_name) {
      doc.text(`Responsável: ${userProfile.full_name}`, pageWidth - 15, logoAreaY + 11, { align: 'right' });
    }
    
    // Linha inferior do cabeçalho
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(10, logoAreaY + logoAreaHeight + 2, pageWidth - 10, logoAreaY + logoAreaHeight + 2);
    
    let yPosition = logoAreaY + logoAreaHeight + 8;
    
    // ========== INFORMAÇÕES GERAIS (Layout tipo planilha) ==========
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('IDENTIFICAÇÃO DO PROJETO', 15, yPosition);
    yPosition += 5;
    
    // Tabela de informações
    const infoTableData = [
      ['Nome do Cálculo:', calculation.name || 'Sem nome'],
      ['Tipo de Cálculo:', calculation.calculator_type],
      ['Data de Criação:', formatDate(calculation.created_at)],
      ['Identificador:', calculation.id.slice(0, 8).toUpperCase()]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      body: infoTableData,
      margin: { left: 15, right: 15 },
      bodyStyles: {
        fontSize: 8,
        textColor: [31, 41, 55],
        cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [249, 250, 251] },
        1: { cellWidth: 'auto' }
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 8;
    
    // ========== DADOS DE ENTRADA (Layout tipo planilha) ==========
    if (calculation.input_data && typeof calculation.input_data === 'object') {
      const inputEntries = Object.entries(calculation.input_data)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .filter(([key]) => !key.includes('customPrices')); // Excluir preços customizados do relatório
      
      if (inputEntries.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('PARÂMETROS DE ENTRADA', 15, yPosition);
        yPosition += 5;
        
        const inputTableData = inputEntries.map(([key, value]) => [
          formatInputLabel(key),
          formatInputValue(key, value)
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Parâmetro', 'Valor']],
          body: inputTableData,
          margin: { left: 15, right: 15 },
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [31, 41, 55],
            cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          columnStyles: {
            0: { cellWidth: 70, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
          },
          styles: {
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 8;
      }
    }
    
    // ========== RESULTADOS PRINCIPAIS (Layout tipo planilha) ==========
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('RESULTADOS DO CÁLCULO', 15, yPosition);
    yPosition += 5;
    
    if (calculation.result && typeof calculation.result === 'object') {
      // Resultados principais em tabela profissional
      const mainResults = [];
      
      if (calculation.result.area && !isNaN(parseFloat(calculation.result.area))) {
        mainResults.push([
          'Área Total',
          `${parseFloat(calculation.result.area).toFixed(2)} m²`
        ]);
      }
      
      if (calculation.result.volume && !isNaN(parseFloat(calculation.result.volume))) {
        mainResults.push([
          'Volume Total',
          `${parseFloat(calculation.result.volume).toFixed(2)} m³`
        ]);
      }
      
      if (calculation.result.totalCostWithBDI) {
        mainResults.push([
          'Custo Total com BDI',
          `R$ ${parseFloat(calculation.result.totalCostWithBDI).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);
      }
      
      if (calculation.result.totalCost) {
        mainResults.push([
          'Custo Total',
          `R$ ${parseFloat(calculation.result.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);
      }
      
      if (mainResults.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          body: mainResults,
          margin: { left: 15, right: 15 },
          bodyStyles: {
            fontSize: 9,
            textColor: [31, 41, 55],
            cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }
          },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold', fillColor: [249, 250, 251] },
            1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
          },
          styles: {
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 8;
      }
      
      // Resumo de custos (se houver)
      if (calculation.result.materialTotal || calculation.result.laborTotal || calculation.result.subtotal) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        
        const summaryData = [];
        
        if (calculation.result.materialTotal) {
          summaryData.push([
            'Total de Materiais',
            `R$ ${calculation.result.materialTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);
        }
        
        if (calculation.result.laborTotal) {
          summaryData.push([
            'Total de Mão de Obra',
            `R$ ${calculation.result.laborTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);
        }
        
        if (calculation.result.subtotal) {
          summaryData.push([
            'Subtotal',
            `R$ ${calculation.result.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);
        }
        
        if (calculation.result.bdiAmount) {
          summaryData.push([
            `BDI (${calculation.result.bdi || 20}%)`,
            `R$ ${calculation.result.bdiAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);
        }
        
        if (calculation.result.costPerM2) {
          summaryData.push([
            'Custo por m²',
            `R$ ${calculation.result.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);
        }
        
        if (summaryData.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [['Item', 'Valor (R$)']],
            body: summaryData,
            margin: { left: 15, right: 15 },
            headStyles: {
              fillColor: accentColor,
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: 'bold',
              cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }
            },
            bodyStyles: {
              fontSize: 8,
              textColor: [31, 41, 55],
              cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }
            },
            alternateRowStyles: {
              fillColor: [249, 250, 251]
            },
            columnStyles: {
              0: { cellWidth: 100, fontStyle: 'bold' },
              1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
            },
            styles: {
              lineColor: [200, 200, 200],
              lineWidth: 0.1
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 8;
        }
      }
      
      // Materiais com tabela detalhada (layout tipo planilha)
      if (calculation.result.materialDetails && Array.isArray(calculation.result.materialDetails)) {
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Título da seção
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('COMPOSIÇÃO DE MATERIAIS E INSUMOS', 15, yPosition);
        yPosition += 6;
        
        // Tabela de materiais com layout profissional
        const materialTableData = calculation.result.materialDetails.map((item: any) => [
          item.name,
          `${item.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 3 })} ${item.unit}`,
          `R$ ${item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Item', 'Quantidade', 'Preço Unitário', 'Total (R$)']],
          body: materialTableData,
          margin: { left: 15, right: 15 },
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [31, 41, 55],
            cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          columnStyles: {
            0: { cellWidth: 70, fontStyle: 'normal' },
            1: { cellWidth: 45, halign: 'right' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
          },
          styles: {
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 8;
        
        // ========== TABELA DE CURVA ABC ==========
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }
        
        const abcCurve = calculateABCCurve(calculation.result.materialDetails);
        
        if (abcCurve.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...primaryColor);
          doc.text('ANÁLISE DE CURVA ABC - CLASSIFICAÇÃO DE MATERIAIS', 15, yPosition);
          yPosition += 6;
          
          // Legenda
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...secondaryColor);
          doc.text('Classificação: A (≤80% do custo) | B (80-95%) | C (>95%)', 15, yPosition);
          yPosition += 5;
          
          const abcTableData = abcCurve.map((item: any) => {
            const highlight = item.classification === 'A';
            return [
              item.rank.toString(),
              item.name,
              `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              `${item.percentage.toFixed(2)}%`,
              `${item.cumulativePercentage.toFixed(2)}%`,
              item.classification
            ];
          });
          
          autoTable(doc, {
            startY: yPosition,
            head: [['#', 'Material', 'Valor Total (R$)', '% Individual', '% Acumulado', 'Class.']],
            body: abcTableData,
            margin: { left: 15, right: 15 },
            headStyles: {
              fillColor: warningColor,
              textColor: [255, 255, 255],
              fontSize: 8,
              fontStyle: 'bold',
              halign: 'center',
              cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }
            },
            bodyStyles: {
              fontSize: 7,
              textColor: [31, 41, 55],
              cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }
            },
            didParseCell: (data: any) => {
              const row = data.row.index;
              const item = abcCurve[row];
              if (item && item.classification === 'A') {
                data.cell.styles.fillColor = [254, 243, 199]; // Destaque amarelo para classe A
                data.cell.styles.fontStyle = 'bold';
              } else if (item && item.classification === 'B') {
                data.cell.styles.fillColor = [219, 234, 254]; // Azul claro para classe B
              }
            },
            columnStyles: {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 70, halign: 'left' },
              2: { cellWidth: 35, halign: 'right' },
              3: { cellWidth: 25, halign: 'right' },
              4: { cellWidth: 25, halign: 'right' },
              5: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }
            },
            styles: {
              lineColor: [200, 200, 200],
              lineWidth: 0.1
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 8;
          
          // Resumo da Curva ABC
          const classA = abcCurve.filter((item: any) => item.classification === 'A');
          const classB = abcCurve.filter((item: any) => item.classification === 'B');
          const classC = abcCurve.filter((item: any) => item.classification === 'C');
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...primaryColor);
          doc.text('RESUMO DA CLASSIFICAÇÃO:', 15, yPosition);
          yPosition += 4;
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...secondaryColor);
          doc.text(`Classe A: ${classA.length} itens (${classA.reduce((sum: number, item: any) => sum + item.percentage, 0).toFixed(2)}% do custo total)`, 18, yPosition);
          yPosition += 3.5;
          doc.text(`Classe B: ${classB.length} itens (${classB.reduce((sum: number, item: any) => sum + item.percentage, 0).toFixed(2)}% do custo total)`, 18, yPosition);
          yPosition += 3.5;
          doc.text(`Classe C: ${classC.length} itens (${classC.reduce((sum: number, item: any) => sum + item.percentage, 0).toFixed(2)}% do custo total)`, 18, yPosition);
          yPosition += 6;
        }
        
        // Resumo de custos
        if (calculation.result.materialTotal || calculation.result.laborTotal) {
          const summaryData = [];
          
          if (calculation.result.materialTotal) {
            summaryData.push([
              'Total de Materiais',
              `R$ ${calculation.result.materialTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ]);
          }
          
          if (calculation.result.laborTotal) {
            summaryData.push([
              'Total de Mão de Obra',
              `R$ ${calculation.result.laborTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ]);
          }
          
          if (calculation.result.costPerM2) {
            summaryData.push([
              'Custo por m²',
              `R$ ${calculation.result.costPerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ]);
          }
          
          autoTable(doc, {
            startY: yPosition,
            body: summaryData,
            margin: { left: 15, right: 15 },
            bodyStyles: {
              fontSize: 10,
              textColor: [31, 41, 55],
              fontStyle: 'bold'
            },
            alternateRowStyles: {
              fillColor: [243, 244, 246]
            },
            columnStyles: {
              0: { cellWidth: 100, fontStyle: 'bold' },
              1: { cellWidth: 'auto', halign: 'right' }
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 10;
        }
      }
      
      // MaterialResult format (para calculadores de material)
      const materialResultEntries = Object.entries(calculation.result).filter(([key, value]) => {
        return value && typeof value === 'object' && 'value' in value && 'unit' in value && 'category' in value;
      });
      
      if (materialResultEntries.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        const primaryItems = materialResultEntries.filter(([_, val]: [string, any]) => val.category === 'primary');
        const secondaryItems = materialResultEntries.filter(([_, val]: [string, any]) => val.category === 'secondary');
        const infoItems = materialResultEntries.filter(([_, val]: [string, any]) => val.category === 'info');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('🧱 MATERIAIS E QUANTITATIVOS', 20, yPosition);
        yPosition += 8;
        
        // Informações gerais
        if (infoItems.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...secondaryColor);
          doc.text('Informações Gerais', 20, yPosition);
          yPosition += 6;
          
          const infoTableData = infoItems.map(([key, data]: [string, any]) => [
            formatInputLabel(key),
            `${data.value} ${data.unit}`
          ]);
          
          autoTable(doc, {
            startY: yPosition,
            body: infoTableData,
            margin: { left: 15, right: 15 },
            bodyStyles: {
              fontSize: 9,
              textColor: [31, 41, 55]
            },
            alternateRowStyles: {
              fillColor: [239, 246, 255]
            },
            columnStyles: {
              0: { cellWidth: 80, fontStyle: 'bold' },
              1: { cellWidth: 'auto' }
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 8;
        }
        
        // Materiais principais
        if (primaryItems.length > 0) {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...accentColor);
          doc.text('Materiais Principais', 20, yPosition);
          yPosition += 6;
          
          const primaryTableData = primaryItems.map(([key, data]: [string, any]) => [
            formatInputLabel(key),
            `${data.value} ${data.unit}`
          ]);
          
          autoTable(doc, {
            startY: yPosition,
            body: primaryTableData,
            margin: { left: 15, right: 15 },
            bodyStyles: {
              fontSize: 9,
              textColor: [31, 41, 55],
              fontStyle: 'bold'
            },
            alternateRowStyles: {
              fillColor: [254, 243, 199]
            },
            columnStyles: {
              0: { cellWidth: 80, fontStyle: 'bold' },
              1: { cellWidth: 'auto' }
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 8;
        }
        
        // Materiais auxiliares
        if (secondaryItems.length > 0) {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...secondaryColor);
          doc.text('Materiais Auxiliares', 20, yPosition);
          yPosition += 6;
          
          const secondaryTableData = secondaryItems.map(([key, data]: [string, any]) => [
            formatInputLabel(key),
            `${data.value} ${data.unit}`
          ]);
          
          autoTable(doc, {
            startY: yPosition,
            body: secondaryTableData,
            margin: { left: 15, right: 15 },
            bodyStyles: {
              fontSize: 9,
              textColor: [75, 85, 99]
            },
            alternateRowStyles: {
              fillColor: [249, 250, 251]
            },
            columnStyles: {
              0: { cellWidth: 80 },
              1: { cellWidth: 'auto' }
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 8;
        }
      }
    }
    
    // ========== NOTAS TÉCNICAS ==========
    const technicalNotes = getTechnicalNotes(calculation.calculator_type, calculation.input_data, calculation.result);
    
    if (technicalNotes.length > 0) {
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Título da seção
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('NOTAS TÉCNICAS E OBSERVAÇÕES', 15, yPosition);
      yPosition += 6;
      
      // Linha divisória
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.line(15, yPosition - 2, pageWidth - 15, yPosition - 2);
      yPosition += 3;
      
      // Notas em formato de lista
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      
      const maxWidth = pageWidth - 30;
      const lineHeight = 4;
      
      technicalNotes.forEach((note) => {
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = 20;
        }
        
        const lines = doc.splitTextToSize(note, maxWidth);
        lines.forEach((line: string) => {
          doc.text(line, 18, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 1; // Espaço entre notas
      });
    }
    
    // ========== RODAPÉ PROFISSIONAL ==========
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Linha superior do rodapé
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.line(10, pageHeight - 18, pageWidth - 10, pageHeight - 18);
      
      // Texto do rodapé
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      
      const footerLeft = `ArqCalc - Sistema de Cálculos para Arquitetura | Gerado em ${new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
      
      doc.text(footerLeft, 10, pageHeight - 12);
      
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 10,
        pageHeight - 12,
        { align: 'right' }
      );
      
      // Linha inferior
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(10, pageHeight - 5, pageWidth - 10, pageHeight - 5);
    }
    
    // Salvar com nome descritivo
    const fileName = `relatorio_${calculation.calculator_type.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${calculation.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getCalculatorTypeIcon(calculation.calculator_type)}
            <span>Detalhes do Cálculo</span>
            {getCalculatorTypeBadge(calculation.calculator_type)}
          </DialogTitle>
          <DialogDescription>
            Visualize os detalhes completos do cálculo realizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Informações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Nome:</span>
                <span className="font-semibold">{calculation.name || 'Sem nome'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Data:</span>
                <span className="font-semibold">{formatDate(calculation.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Tipo:</span>
                <span className="font-semibold">{calculation.calculator_type}</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Dados de Entrada */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Entrada</CardTitle>
            </CardHeader>
            <CardContent>
              {renderInputData()}
            </CardContent>
          </Card>

          <Separator />

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {renderResultData()}
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end space-x-3 pt-4 flex-wrap gap-2">
            {showShareButton && (
              <Button variant="outline" onClick={() => setShowShareModal(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            )}
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={exportCalculation}>
              <Download className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Modal de compartilhamento */}
      <ShareCalculationModal
        calculationId={calculation.id}
        calculationName={calculation.name || 'Cálculo sem nome'}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </Dialog>
  );
};
