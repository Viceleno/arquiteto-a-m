
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HardHat, Save, Calculator, AlertCircle } from 'lucide-react';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Importar os novos módulos
import { materialCalculators, MaterialCalculatorType } from './material/calculators';
import { MaterialInputRenderer } from './material/components/MaterialInputRenderer';
import { MaterialResultDisplay } from './material/components/MaterialResultDisplay';
import { MaterialResult } from './material/MaterialCalculatorTypes';

export const MaterialCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveCalculation } = useCalculationService();
  
  const [category, setCategory] = useState<MaterialCalculatorType>('flooring');
  const [inputs, setInputs] = useState<Record<string, number | string>>({});
  const [result, setResult] = useState<MaterialResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Limpar inputs e resultados ao mudar de categoria
  useEffect(() => {
    setInputs({});
    setResult(null);
  }, [category]);

  const updateInput = (key: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const calculateMaterial = async () => {
    const calculator = materialCalculators[category];
    
    if (!calculator) {
      toast({
        title: "Erro",
        description: "Calculadora não encontrada",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      const calculation = calculator.calculate(inputs);
      
      if (Object.keys(calculation).length === 0) {
        // Erro de validação já foi tratado pela função calculate
        return;
      }
      
      setResult(calculation);
      
      toast({
        title: "Cálculo realizado",
        description: "Materiais calculados com sucesso!",
      });
    } catch (error) {
      console.error('Erro no cálculo:', error);
      toast({
        title: "Erro no cálculo",
        description: "Verifique os dados inseridos e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const saveMaterialCalculation = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar seu cálculo",
        variant: "destructive",
      });
      return;
    }
    
    if (!result) {
      toast({
        title: "Nenhum resultado",
        description: "Realize um cálculo antes de salvar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveCalculation({
        calculator_type: 'Cálculo de Materiais',
        input_data: { category, inputs },
        result,
        name: `${materialCalculators[category].name} - ${new Date().toLocaleDateString()}`
      });
      
      toast({
        title: "Sucesso",
        description: "Cálculo salvo com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cálculo",
        variant: "destructive",
      });
    }
  };

  const currentCalculator = materialCalculators[category];

  return (
    <div className="w-full max-w-none mx-auto px-2 sm:px-4">
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-lg sm:text-xl">
            <HardHat className="w-5 h-5 flex-shrink-0" />
            <span className="text-left">Calculadora de Materiais e Dimensionamento</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Cálculos detalhados e precisos para arquitetura e construção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Seleção de Categoria */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Categoria de Cálculo</Label>
            <Select value={category} onValueChange={(value: MaterialCalculatorType) => setCategory(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(materialCalculators).map(([key, calc]) => (
                  <SelectItem key={key} value={key}>
                    {calc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {currentCalculator.description}
            </p>
          </div>

          {/* Inputs da Categoria Selecionada */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-semibold">Dados de Entrada</h3>
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <MaterialInputRenderer
              inputs={currentCalculator.inputs}
              values={inputs}
              onChange={updateInput}
            />
          </div>

          {/* Botão de Cálculo */}
          <Button 
            onClick={calculateMaterial} 
            className="w-full h-11 text-sm sm:text-base" 
            disabled={isCalculating}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? 'Calculando...' : 'Calcular Materiais'}
          </Button>

          {/* Resultados */}
          {result && Object.keys(result).length > 0 && (
            <div className="space-y-4">
              <MaterialResultDisplay
                result={result}
                categoryName={currentCalculator.name}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={saveMaterialCalculation}
                className="w-full h-10 text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Cálculo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
