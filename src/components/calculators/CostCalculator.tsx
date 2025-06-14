
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save, AlertCircle, Info, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  
  const [material, setMaterial] = useState('');
  const [area, setArea] = useState<string>('');
  const [complexity, setComplexity] = useState('');
  const [bdi, setBdi] = useState<string>('');
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

  const isFormValid = material && area && complexity && bdi;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <DollarSign className="w-6 h-6" />
            <span>Estimativa de Custos Detalhada</span>
          </CardTitle>
          <CardDescription className="text-base">
            Calcule custos com detalhamento de materiais, insumos e mão de obra baseada em produtividade
          </CardDescription>
          
          {/* Informação didática */}
          <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-2">Como funciona o cálculo de custos:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Materiais:</strong> Calculados com base na área e tipo escolhido</li>
                <li>• <strong>Mão de obra:</strong> Estimada pela produtividade e complexidade</li>
                <li>• <strong>BDI:</strong> Benefícios e Despesas Indiretas (impostos, lucro, administração)</li>
                <li>• <strong>Complexidade:</strong> Afeta diretamente o tempo de execução</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Material */}
            <Card className="p-4 bg-card border-border hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Material da Obra
                      <span className="text-red-500 ml-1 text-base">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Escolha o material principal que será utilizado na obra</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Calculator className="w-4 h-4 text-muted-foreground" />
                </div>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger className="h-11 bg-background border-input hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Selecione o material principal..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {Object.entries(materialsDatabase).map(([key, data]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground italic">
                  Material principal determina custos base e produtividade
                </p>
              </CardContent>
            </Card>

            {/* Área */}
            <Card className="p-4 bg-card border-border hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Área da Obra
                      <span className="text-muted-foreground ml-1 font-normal">
                        ({material && materialsDatabase[material]?.baseUnit === 'm³' ? 'da laje ' : ''}m²)
                      </span>
                      <span className="text-red-500 ml-1 text-base">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Área total a ser executada em metros quadrados</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Calculator className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  type="number"
                  placeholder="Ex: 100.50"
                  min="0"
                  step="0.01"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`h-11 bg-background border-input hover:border-primary/50 focus:border-primary transition-colors ${
                    validationErrors.some(error => error.includes('Área')) ? 'border-red-500' : ''
                  }`}
                />
                <p className="text-xs text-muted-foreground italic">
                  Informe a área total em metros quadrados
                </p>
              </CardContent>
            </Card>

            {/* Complexidade */}
            <Card className="p-4 bg-card border-border hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Complexidade
                      <span className="text-red-500 ml-1 text-base">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Nível de dificuldade da execução da obra</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Calculator className="w-4 h-4 text-muted-foreground" />
                </div>
                <Select value={complexity} onValueChange={setComplexity}>
                  <SelectTrigger className="h-11 bg-background border-input hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Selecione o nível de complexidade..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {Object.entries(complexityFactors).map(([key, data]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground italic">
                  Afeta tempo de execução e custo da mão de obra
                </p>
              </CardContent>
            </Card>

            {/* BDI */}
            <Card className="p-4 bg-card border-border hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-semibold text-foreground">
                      BDI (%)
                      <span className="text-red-500 ml-1 text-base">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Benefícios e Despesas Indiretas: impostos, lucro, administração</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Calculator className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  type="number"
                  placeholder="Ex: 20 (padrão SINAPI)"
                  min="0"
                  max="100"
                  step="1"
                  value={bdi}
                  onChange={(e) => setBdi(e.target.value)}
                  className={`h-11 bg-background border-input hover:border-primary/50 focus:border-primary transition-colors ${
                    validationErrors.some(error => error.includes('BDI')) ? 'border-red-500' : ''
                  }`}
                />
                <p className="text-xs text-muted-foreground italic">
                  Percentual padrão: 15-25% (SINAPI recomenda ~20%)
                </p>
              </CardContent>
            </Card>
          </div>

          {validationErrors.length > 0 && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-800 dark:text-red-200 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Corrija os seguintes erros:</span>
                </div>
                <ul className="ml-7 list-disc text-red-700 dark:text-red-300 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={calculateCosts} 
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors" 
            disabled={isCalculating || !isFormValid}
          >
            <Calculator className="w-5 h-5 mr-2" />
            {isCalculating ? 'Calculando custos detalhados...' : 'Calcular Custos Detalhados'}
          </Button>
          
          {!isFormValid && (
            <p className="text-center text-sm text-muted-foreground">
              Preencha todos os campos obrigatórios (*) para calcular
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Gráfico de Distribuição de Custos */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center gap-2 text-primary">
                <DollarSign className="w-5 h-5" />
                Distribuição de Custos
              </CardTitle>
              <CardDescription>
                Visualização detalhada da composição dos custos do projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <CostResultChart result={result} />
            </CardContent>
          </Card>

          {/* Detalhamento Completo */}
          <CostResultDetails result={result} />

          {/* Botão de Salvar */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <Button
                onClick={handleSaveCalculation}
                variant="outline"
                className="w-full h-12 text-base font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                Salvar Orçamento Detalhado
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
