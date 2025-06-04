
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save, AlertCircle } from 'lucide-react';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CostCalculatorEngine } from './cost/CostCalculatorEngine';
import { CostResultChart } from './cost/CostResultChart';
import { CostResultDetails } from './cost/CostResultDetails';
import { complexityFactors, materialsDatabase } from './cost/CostCalculatorTypes';
import type { CostResult } from './cost/CostCalculatorTypes';

export const CostCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveCalculation } = useCalculationService();
  
  const [material, setMaterial] = useState('concrete');
  const [area, setArea] = useState<string>('');
  const [complexity, setComplexity] = useState('simple');
  const [bdi, setBdi] = useState<string>('20');
  const [result, setResult] = useState<CostResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const calculateCosts = () => {
    const areaNumber = parseFloat(area);
    const bdiNumber = parseFloat(bdi);
    
    // Validar inputs
    const errors = CostCalculatorEngine.validateInputs(areaNumber, bdiNumber);
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }

    setIsCalculating(true);
    
    try {
      const calculationResult = CostCalculatorEngine.calculateCosts(
        material,
        areaNumber,
        complexity as keyof typeof complexityFactors,
        bdiNumber
      );
      
      setResult(calculationResult);
      setValidationErrors([]);
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao calcular os custos. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro no cálculo:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveCalculation = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar seu cálculo",
        variant: "destructive",
      });
      return;
    }
    
    if (!result) return;
    
    await saveCalculation({
      calculator_type: 'Estimativa de Custos Detalhada',
      input_data: {
        material,
        area: parseFloat(area),
        complexity,
        bdi: parseFloat(bdi)
      },
      result,
      name: `${result.material} - ${area}m² (${complexity})`
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Estimativa de Custos Detalhada</span>
          </CardTitle>
          <CardDescription>
            Calcule custos com detalhamento de materiais, insumos e mão de obra baseada em produtividade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Material</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(materialsDatabase).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">
                Área ({materialsDatabase[material]?.baseUnit === 'm³' ? 'da laje ' : ''}m²)
              </Label>
              <Input
                id="area"
                type="number"
                placeholder="Digite a área"
                min="0"
                step="0.01"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={validationErrors.some(error => error.includes('Área')) ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label>Complexidade</Label>
              <Select value={complexity} onValueChange={setComplexity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(complexityFactors).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bdi">BDI (%)</Label>
              <Input
                id="bdi"
                type="number"
                placeholder="20"
                min="0"
                max="100"
                step="1"
                value={bdi}
                onChange={(e) => setBdi(e.target.value)}
                className={validationErrors.some(error => error.includes('BDI')) ? 'border-red-500' : ''}
              />
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Corrija os seguintes erros:</span>
              </div>
              <ul className="mt-2 ml-6 list-disc text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <Button 
            onClick={calculateCosts} 
            className="w-full" 
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculando...' : 'Calcular Custos Detalhados'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Gráfico de Distribuição de Custos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <CostResultChart result={result} />
            </CardContent>
          </Card>

          {/* Detalhamento Completo */}
          <CostResultDetails result={result} />

          {/* Botão de Salvar */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSaveCalculation}
                variant="outline"
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Orçamento Detalhado
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
