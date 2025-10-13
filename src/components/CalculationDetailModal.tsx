
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Calendar, User, FileText, Download, Share2, FileDown } from 'lucide-react';
import { ShareCalculationModal } from '@/components/ShareCalculationModal';
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Cores do tema
    const primaryColor: [number, number, number] = [37, 99, 235]; // Blue-600
    const secondaryColor: [number, number, number] = [107, 114, 128]; // Gray-500
    const accentColor: [number, number, number] = [249, 115, 22]; // Orange-500
    
    // Cabeçalho com fundo colorido
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE CÁLCULO', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(calculation.calculator_type, pageWidth / 2, 25, { align: 'center' });
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 45;
    
    // Box de Informações Gerais
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15, yPosition, pageWidth - 30, 28, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('📋 INFORMAÇÕES GERAIS', 20, yPosition + 7);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const infoData = [
      ['Nome:', calculation.name || 'Sem nome'],
      ['Data:', formatDate(calculation.created_at)],
      ['ID:', calculation.id.slice(0, 8).toUpperCase()]
    ];
    
    let infoY = yPosition + 14;
    infoData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, infoY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 50, infoY);
      infoY += 5;
    });
    
    yPosition += 35;
    
    // Dados de Entrada com tabela
    if (calculation.input_data && typeof calculation.input_data === 'object') {
      const inputEntries = Object.entries(calculation.input_data)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '');
      
      if (inputEntries.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('📝 DADOS DE ENTRADA', 20, yPosition);
        yPosition += 2;
        
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
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [31, 41, 55]
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
    }
    
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Resultados
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('📊 RESULTADOS', 20, yPosition);
    yPosition += 8;
    
    doc.setTextColor(0, 0, 0);
    
    if (calculation.result && typeof calculation.result === 'object') {
      // Resultados principais em destaque
      const mainResults = [];
      
      if (calculation.result.area && !isNaN(parseFloat(calculation.result.area))) {
        mainResults.push({
          label: 'Área Total',
          value: `${parseFloat(calculation.result.area).toFixed(2)} m²`,
          color: [59, 130, 246]
        });
      }
      
      if (calculation.result.volume && !isNaN(parseFloat(calculation.result.volume))) {
        mainResults.push({
          label: 'Volume Total',
          value: `${parseFloat(calculation.result.volume).toFixed(2)} m³`,
          color: [59, 130, 246]
        });
      }
      
      if (calculation.result.totalCostWithBDI) {
        mainResults.push({
          label: 'Custo Total com BDI',
          value: `R$ ${parseFloat(calculation.result.totalCostWithBDI).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          color: [34, 197, 94]
        });
      }
      
      if (calculation.result.totalCost) {
        mainResults.push({
          label: 'Custo Total',
          value: `R$ ${parseFloat(calculation.result.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          color: [107, 114, 128]
        });
      }
      
      // Exibir resultados principais em boxes
      mainResults.forEach((result) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFillColor(result.color[0], result.color[1], result.color[2], 0.1);
        doc.roundedRect(15, yPosition - 5, pageWidth - 30, 15, 2, 2, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...secondaryColor);
        doc.text(result.label, 20, yPosition);
        
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(result.color[0], result.color[1], result.color[2]);
        doc.text(result.value, pageWidth - 20, yPosition + 5, { align: 'right' });
        
        yPosition += 20;
      });
      
      doc.setTextColor(0, 0, 0);
      yPosition += 5;
      
      // Materiais com tabela detalhada
      if (calculation.result.materialDetails && Array.isArray(calculation.result.materialDetails)) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('🧱 MATERIAIS DETALHADOS', 20, yPosition);
        yPosition += 2;
        
        const materialTableData = calculation.result.materialDetails.map((item: any) => [
          item.name,
          `${item.quantity.toLocaleString('pt-BR')} ${item.unit}`,
          `R$ ${item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Material', 'Quantidade', 'Preço Unit.', 'Total']],
          body: materialTableData,
          margin: { left: 15, right: 15 },
          headStyles: {
            fillColor: accentColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [31, 41, 55]
          },
          alternateRowStyles: {
            fillColor: [254, 243, 199]
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 40, fontStyle: 'bold' }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
        
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
    
    // Rodapé em todas as páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Linha superior do rodapé
      doc.setDrawColor(229, 231, 235);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      // Texto do rodapé
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      
      doc.text(
        `Relatório gerado em ${new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        15,
        pageHeight - 8
      );
      
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 15,
        pageHeight - 8,
        { align: 'right' }
      );
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
