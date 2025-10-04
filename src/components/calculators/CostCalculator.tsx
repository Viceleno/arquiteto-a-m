import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save, AlertCircle, Info, Calculator, BookOpen, TrendingUp, Zap, Clock, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CostCalculatorEngine } from './cost/CostCalculatorEngine';
import { CostResultChart } from './cost/CostResultChart';
import { CostResultDetails } from './cost/CostResultDetails';
import { complexityFactors, materialsDatabase } from './cost/CostCalculatorTypes';
import type { CostResult, MaterialInputField } from './cost/CostCalculatorTypes';

export const CostCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveCalculation } = useCalculationService();
  
  const [material, setMaterial] = useState('');
  const [materialInputs, setMaterialInputs] = useState<Record<string, number | string>>({});
  const [complexity, setComplexity] = useState('');
  const [bdi, setBdi] = useState<string>('20');
  const [result, setResult] = useState<CostResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [showCustomPrices, setShowCustomPrices] = useState(false);

  const handleMaterialChange = (newMaterial: string) => {
    setMaterial(newMaterial);
    // Reset inputs when material changes
    const materialData = materialsDatabase[newMaterial];
    if (materialData) {
      const initialInputs: Record<string, number | string> = {};
      materialData.inputFields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialInputs[field.key] = field.defaultValue;
        }
      });
      setMaterialInputs(initialInputs);
    }
    setResult(null);
    setValidationErrors([]);
  };

  const handleInputChange = (key: string, value: number | string) => {
    setMaterialInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderMaterialInputs = () => {
    if (!material) return null;
    
    const materialData = materialsDatabase[material];
    if (!materialData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materialData.inputFields.map((field: MaterialInputField) => (
          <Card key={field.key} className="p-4 bg-card border-border hover:shadow-md transition-shadow">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-semibold text-foreground">
                    {field.label}
                    {field.unit && (
                      <span className="text-muted-foreground ml-1 font-normal">({field.unit})</span>
                    )}
                    {field.required && (
                      <span className="text-red-500 ml-1 text-base">*</span>
                    )}
                  </Label>
                  {field.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">{field.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <Calculator className="w-4 h-4 text-muted-foreground" />
              </div>

              {field.type === 'number' ? (
                <Input
                  type="number"
                  placeholder={field.placeholder || `Ex: ${field.defaultValue || 0}`}
                  min={field.min}
                  max={field.max}
                  step={field.step || 0.01}
                  value={materialInputs[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="h-11 bg-background border-input hover:border-primary/50 focus:border-primary transition-colors"
                />
              ) : field.type === 'select' ? (
                <Select 
                  value={String(materialInputs[field.key] || field.defaultValue || '')} 
                  onValueChange={(value) => handleInputChange(field.key, value)}
                >
                  <SelectTrigger className="h-11 bg-background border-input hover:border-primary/50 transition-colors">
                    <SelectValue placeholder={field.placeholder || 'Selecione...'} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {field.options?.map(option => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const calculateCosts = () => {
    const bdiNumber = bdi ? parseFloat(bdi) : 20;
    
    // Validar inputs usando a nova função do engine
    const errors = CostCalculatorEngine.validateInputs(material, materialInputs, bdiNumber);
    
    if (!material) {
      errors.unshift('Selecione um material da obra');
    }
    
    if (!complexity) {
      errors.push('Selecione o nível de complexidade');
    }
    
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }

    setIsCalculating(true);
    
    try {
      const calculationResult = CostCalculatorEngine.calculateCosts(
        material,
        materialInputs,
        complexity as keyof typeof complexityFactors,
        bdiNumber,
        customPrices
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
        materialInputs,
        complexity,
        bdi: parseFloat(bdi) || 20,
        customPrices
      },
      result,
      name: `${result.material} - ${materialInputs.area}m² (${complexity})`
    });
  };

  const isFormValid = material && complexity && Object.keys(materialInputs).length > 0;

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
                <li>• <strong>Materiais:</strong> Calculados com base nos dados específicos do material</li>
                <li>• <strong>Mão de obra:</strong> Estimada pela produtividade e complexidade</li>
                <li>• <strong>BDI:</strong> Benefícios e Despesas Indiretas (impostos, lucro, administração)</li>
                <li>• <strong>Complexidade:</strong> Afeta diretamente o tempo de execução</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Material Selection */}
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
              <Select value={material} onValueChange={handleMaterialChange}>
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
                Cada material possui campos específicos de preenchimento
              </p>
            </CardContent>
          </Card>

          {/* Dynamic Material Inputs */}
          {renderMaterialInputs()}

          {/* Complexity and BDI */}
          {material && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <div className="flex items-center justify-between w-full">
                            <span>{data.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({data.factor}x)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground italic">
                    Multiplica o tempo de execução da mão de obra
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
                        <span className="text-muted-foreground ml-1 font-normal text-xs">(opcional)</span>
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
                    placeholder="Padrão: 20% (deixe vazio para usar)"
                    min="0"
                    max="100"
                    step="1"
                    value={bdi}
                    onChange={(e) => setBdi(e.target.value)}
                    className="h-11 bg-background border-input hover:border-primary/50 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground italic">
                    Se não informado, será usado 20% (padrão SINAPI)
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customização de Preços */}
          {material && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                        Valores Regionais
                      </CardTitle>
                      <CardDescription className="text-orange-700 dark:text-orange-300">
                        Personalize os preços dos materiais conforme sua região
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomPrices(!showCustomPrices)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    {showCustomPrices ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="ml-1">{showCustomPrices ? 'Ocultar' : 'Personalizar'}</span>
                  </Button>
                </div>
              </CardHeader>
              
              {showCustomPrices && (
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                      <strong>Dica:</strong> Os valores padrão são baseados na tabela SINAPI. 
                      Ajuste conforme os preços praticados em sua região.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materialsDatabase[material]?.compositions.map((item, index) => (
                      <Card key={index} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-semibold">{item.name}</Label>
                            <p className="text-xs text-muted-foreground">{item.unit}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={item.unitPrice.toFixed(2)}
                              value={customPrices[`${material}_${index}`] || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setCustomPrices(prev => ({
                                  ...prev,
                                  [`${material}_${index}`]: value
                                }));
                              }}
                              className="h-9 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">/{item.unit}</span>
                          </div>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            Padrão: R$ {item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Seção educativa sobre Complexidade */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                    Como a Complexidade Afeta o Custo da Obra?
                  </CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    A complexidade determina quanto tempo e esforço será necessário para executar o serviço
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-purple-900 dark:text-purple-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Simples */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <h4 className="font-semibold">Simples (1.0x)</h4>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-xs mb-2"><strong>Características:</strong></p>
                    <ul className="text-xs space-y-1">
                      <li>• Geometria regular e retilínea</li>
                      <li>• Poucos ou nenhum recorte</li>
                      <li>• Fácil acesso para equipamentos</li>
                      <li>• Repetição de padrões</li>
                    </ul>
                    <p className="text-xs mt-2 font-medium text-green-700 dark:text-green-300">
                      Exemplo: Parede reta, laje plana, piso em ambiente quadrado
                    </p>
                  </div>
                </div>

                {/* Média */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    </div>
                    <h4 className="font-semibold">Média (1.3x)</h4>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-xs mb-2"><strong>Características:</strong></p>
                    <ul className="text-xs space-y-1">
                      <li>• Algumas irregularidades</li>
                      <li>• Recortes moderados</li>
                      <li>• Necessita mais cuidado</li>
                      <li>• Alguns obstáculos</li>
                    </ul>
                    <p className="text-xs mt-2 font-medium text-yellow-700 dark:text-yellow-300">
                      Exemplo: Parede com portas e janelas, escada reta, piso com recortes
                    </p>
                  </div>
                </div>

                {/* Complexa */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <h4 className="font-semibold">Complexa (1.8x)</h4>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-xs mb-2"><strong>Características:</strong></p>
                    <ul className="text-xs space-y-1">
                      <li>• Geometria irregular</li>
                      <li>• Muitos recortes e detalhes</li>
                      <li>• Difícil acesso</li>
                      <li>• Acabamentos especiais</li>
                    </ul>
                    <p className="text-xs mt-2 font-medium text-red-700 dark:text-red-300">
                      Exemplo: Parede curva, escada caracol, piso com desenhos
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Como é calculado o impacto:</h4>
                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs mb-2">
                        <strong>Tempo Real = Tempo Base × Fator de Complexidade</strong>
                      </p>
                      <p className="text-xs">
                        <strong>Exemplo prático:</strong> Se um pedreiro consegue fazer 15m² de alvenaria simples por dia, 
                        em uma obra complexa (1.8x) ele fará apenas 8.3m² por dia (15 ÷ 1.8), resultando em mais dias de trabalho 
                        e consequentemente maior custo de mão de obra.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção educativa sobre BDI */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                    O que é BDI e por que é importante?
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    Compreenda como o BDI afeta o custo final do seu projeto
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-amber-900 dark:text-amber-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    O que inclui o BDI:
                  </h4>
                  <ul className="space-y-1 text-xs ml-6">
                    <li>• <strong>Administração central:</strong> Custos de escritório e gestão</li>
                    <li>• <strong>Lucro:</strong> Margem de lucro da construtora</li>
                    <li>• <strong>Impostos:</strong> ISS, PIS, COFINS, IRPJ, CSLL</li>
                    <li>• <strong>Riscos:</strong> Contingências e imprevistos</li>
                    <li>• <strong>Seguros:</strong> Seguros obrigatórios da obra</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Como é calculado:
                  </h4>
                  <div className="text-xs space-y-2 ml-6">
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="font-mono text-center">
                        <strong>Custo Final = (Materiais + Mão de Obra) × (1 + BDI/100)</strong>
                      </p>
                    </div>
                    <p>
                      <strong>Exemplo:</strong> Se o custo direto é R$ 10.000 e o BDI é 20%, 
                      o valor final será R$ 12.000 (R$ 10.000 × 1,20).
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Dica profissional:</strong> O SINAPI (Sistema Nacional de Pesquisa de Custos) 
                  recomenda BDI entre 15% e 25% para obras públicas. Para obras privadas, 
                  pode variar entre 20% e 30% dependendo do porte e complexidade.
                </p>
              </div>
            </CardContent>
          </Card>

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
