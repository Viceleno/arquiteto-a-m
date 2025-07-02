
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Calendar, User, FileText, Download, Share2 } from 'lucide-react';
import { ShareCalculationModal } from '@/components/ShareCalculationModal';

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
      length: 'Comprimento (m)',
      width: 'Largura (m)',
      height: 'Altura (m)',
      diameter: 'Diâmetro (m)',
      radius: 'Raio (m)',
      thickness: 'Espessura (m)',
      area: 'Área (m²)',
      rooms: 'Número de Cômodos',
      windows: 'Número de Janelas',
      doors: 'Número de Portas',
      wallHeight: 'Altura da Parede (m)',
      wallLength: 'Comprimento da Parede (m)',
      brickType: 'Tipo de Tijolo',
      mortarType: 'Tipo de Argamassa',
      cementType: 'Tipo de Cimento',
      flooringType: 'Tipo de Piso',
      paintType: 'Tipo de Tinta',
      roofType: 'Tipo de Telhado',
      quantity: 'Quantidade',
      unitCost: 'Custo Unitário (R$)',
      laborCost: 'Custo de Mão de Obra (R$)',
      bdi: 'BDI (%)',
      margin: 'Margem (%)',
      materialType: 'Tipo de Material',
      calculationType: 'Tipo de Cálculo'
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
        {calculation.result.area && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Área Total</h4>
            <p className="text-2xl font-bold text-blue-800">
              {parseFloat(calculation.result.area).toFixed(2)} m²
            </p>
          </div>
        )}

        {/* Volume Calculado */}
        {calculation.result.volume && (
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

        {/* Materiais Necessários */}
        {calculation.result.materials && Object.keys(calculation.result.materials).length > 0 && (
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
          if (['area', 'volume', 'totalCostWithBDI', 'totalCost', 'materials', 'totalBricks', 'cementBags', 'paintCans'].includes(key)) return null;
          if (value === null || value === undefined) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getCalculatorTypeIcon(calculation.calculator_type)}
            <span>Detalhes do Cálculo</span>
            {getCalculatorTypeBadge(calculation.calculator_type)}
          </DialogTitle>
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
          <div className="flex justify-end space-x-3 pt-4">
            {showShareButton && (
              <Button variant="outline" onClick={() => setShowShareModal(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            )}
            <Button variant="outline" onClick={exportCalculation}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Cálculo
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
