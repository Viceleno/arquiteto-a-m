
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Calendar, User, FileText, Download } from 'lucide-react';

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
}

export const CalculationDetailModal: React.FC<CalculationDetailModalProps> = ({
  calculation,
  isOpen,
  onClose,
}) => {
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
              <span className="font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </span>
              <span className="text-gray-900">{String(value)}</span>
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
        {/* Resultado Principal */}
        {calculation.result.area && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Área Calculada</h4>
            <p className="text-2xl font-bold text-blue-800">
              {parseFloat(calculation.result.area).toFixed(2)} {calculation.result.unit || 'm²'}
            </p>
          </div>
        )}

        {calculation.result.volume && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Volume Calculado</h4>
            <p className="text-2xl font-bold text-blue-800">
              {parseFloat(calculation.result.volume).toFixed(2)} {calculation.result.unit || 'm³'}
            </p>
          </div>
        )}

        {calculation.result.totalCostWithBDI && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Custo Total com BDI</h4>
            <p className="text-2xl font-bold text-green-800">
              R$ {parseFloat(calculation.result.totalCostWithBDI).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Materiais */}
        {calculation.result.materials && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-3">Materiais Necessários</h4>
            <div className="space-y-2">
              {Object.entries(calculation.result.materials).map(([material, quantity]) => (
                <div key={material} className="flex justify-between items-center">
                  <span className="text-orange-800 capitalize">{material}:</span>
                  <span className="font-semibold text-orange-900">{String(quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outros resultados */}
        {Object.entries(calculation.result).map(([key, value]) => {
          if (['area', 'volume', 'totalCostWithBDI', 'materials', 'unit'].includes(key)) return null;
          if (value === null || value === undefined) return null;

          return (
            <div key={key} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </span>
              <span className="text-gray-900 font-semibold">{String(value)}</span>
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
    </Dialog>
  );
};
