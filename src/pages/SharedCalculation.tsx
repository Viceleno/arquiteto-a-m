import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Calendar, Eye, Share2, AlertCircle } from 'lucide-react';
import { getSharedCalculation } from '@/services/sharingService';
import { CalculationDetailModal } from '@/components/CalculationDetailModal';

export const SharedCalculation = () => {
  const { token } = useParams<{ token: string }>();
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchSharedCalculation = async () => {
      if (!token) {
        setError('Token inválido');
        setLoading(false);
        return;
      }

      const result = await getSharedCalculation(token);
      
      if (result.success) {
        setCalculation(result.data);
      } else {
        setError(result.error || 'Cálculo não encontrado');
      }
      
      setLoading(false);
    };

    fetchSharedCalculation();
  }, [token]);

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
    if (type.includes('Área')) return <Calculator className="w-6 h-6 text-blue-600" />;
    if (type.includes('Material')) return <Calculator className="w-6 h-6 text-orange-600" />;
    if (type.includes('Custo')) return <Calculator className="w-6 h-6 text-green-600" />;
    return <Calculator className="w-6 h-6 text-gray-600" />;
  };

  const getCalculatorTypeBadge = (type: string) => {
    if (type.includes('Área')) return <Badge className="bg-blue-100 text-blue-800">Área</Badge>;
    if (type.includes('Material')) return <Badge className="bg-orange-100 text-orange-800">Material</Badge>;
    if (type.includes('Custo')) return <Badge className="bg-green-100 text-green-800">Custo</Badge>;
    return <Badge variant="outline">{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cálculo compartilhado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cálculo não encontrado</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              O link pode ter expirado ou sido desativado pelo proprietário.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {getCalculatorTypeIcon(calculation.calculator_type)}
              <h1 className="text-3xl font-bold text-gray-900">
                {calculation.name || 'Cálculo Compartilhado'}
              </h1>
              {getCalculatorTypeBadge(calculation.calculator_type)}
            </div>
            <p className="text-gray-600">
              Cálculo compartilhado • Visualização somente leitura
            </p>
          </div>

          {/* Informações do cálculo */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Share2 className="w-6 h-6 text-blue-600" />
                <span>Informações do Cálculo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">{calculation.calculator_type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Criado em</p>
                    <p className="font-medium">{formatDate(calculation.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-green-600">Ativo</p>
                  </div>
                </div>
              </div>

              {calculation.share_expires_at && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Este link expira em {formatDate(calculation.share_expires_at)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ação para ver detalhes */}
          <div className="text-center">
            <Button
              onClick={() => setShowDetail(true)}
              size="lg"
              className="px-8"
            >
              <Eye className="w-5 h-5 mr-2" />
              Ver Detalhes do Cálculo
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>
              Este cálculo foi compartilhado usando o Sistema de Calculadoras de Construção
            </p>
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      <CalculationDetailModal
        calculation={calculation}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        showShareButton={false}
      />
    </div>
  );
};