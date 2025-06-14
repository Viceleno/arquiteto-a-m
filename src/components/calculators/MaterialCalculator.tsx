
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HardHat, Save, Calculator, AlertCircle, BookOpen, Lightbulb } from 'lucide-react';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Importar os módulos
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
        setIsCalculating(false);
        return;
      }
      
      setResult(calculation);
      
      toast({
        title: "Cálculo Concluído",
        description: "Materiais calculados com sucesso! Verifique os resultados abaixo.",
      });
    } catch (error) {
      console.error('Erro no cálculo:', error);
      toast({
        title: "Erro no Cálculo",
        description: "Verifique os dados inseridos e tente novamente. Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const saveMaterialCalculation = async () => {
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Faça login para salvar seus cálculos",
        variant: "destructive",
      });
      return;
    }
    
    if (!result) {
      toast({
        title: "Nenhum Resultado",
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
        name: `${materialCalculators[category].name} - ${new Date().toLocaleDateString('pt-BR')}`
      });
      
      toast({
        title: "Sucesso",
        description: "Cálculo salvo no seu histórico!",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o cálculo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const currentCalculator = materialCalculators[category];

  // Verificar se todos os campos obrigatórios estão preenchidos
  const hasRequiredFields = () => {
    return currentCalculator.inputs
      .filter(input => input.required)
      .every(input => {
        const value = inputs[input.key];
        return value !== undefined && value !== '' && value !== null;
      });
  };

  return (
    <div className="w-full max-w-none mx-auto px-2 sm:px-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="px-4 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-lg sm:text-xl">
            <div className="flex items-center space-x-2">
              <HardHat className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <span className="text-left">Calculadora de Materiais e Dimensionamento</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Profissional
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Cálculos detalhados e precisos para arquitetura e construção. 
            Desenvolvido com base em normas técnicas brasileiras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6 py-6">
          {/* Seleção de Categoria */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-semibold">Categoria de Cálculo</Label>
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <Select value={category} onValueChange={(value: MaterialCalculatorType) => setCategory(value)}>
              <SelectTrigger className="w-full h-12 bg-background border-input hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {Object.entries(materialCalculators).map(([key, calc]) => (
                  <SelectItem 
                    key={key} 
                    value={key}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer py-3"
                  >
                    <div>
                      <div className="font-medium">{calc.name}</div>
                      <div className="text-xs text-muted-foreground">{calc.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Informação sobre a categoria selecionada */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>{currentCalculator.name}:</strong> {currentCalculator.description}
              </p>
            </div>
          </div>

          {/* Inputs da Categoria Selecionada */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Dados de Entrada
              </h3>
              <Badge variant="outline" className="text-xs">
                {currentCalculator.inputs.filter(i => i.required).length} obrigatórios
              </Badge>
            </div>
            
            <MaterialInputRenderer
              inputs={currentCalculator.inputs}
              values={inputs}
              onChange={updateInput}
            />
          </div>

          {/* Botão de Cálculo */}
          <div className="space-y-2">
            <Button 
              onClick={calculateMaterial} 
              className="w-full h-12 text-sm sm:text-base font-medium" 
              disabled={isCalculating || !hasRequiredFields()}
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {isCalculating ? 'Calculando...' : 'Calcular Materiais'}
            </Button>
            
            {!hasRequiredFields() && (
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs">
                  Preencha todos os campos obrigatórios (marcados com *) para calcular.
                </p>
              </div>
            )}
          </div>

          {/* Resultados */}
          {result && Object.keys(result).length > 0 && (
            <div className="space-y-4">
              <MaterialResultDisplay
                result={result}
                categoryName={currentCalculator.name}
              />
              
              <Button
                variant="outline"
                size="lg"
                onClick={saveMaterialCalculation}
                className="w-full h-11 text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Cálculo no Histórico
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
