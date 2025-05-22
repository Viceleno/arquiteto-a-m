
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save } from 'lucide-react';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const CostCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveCalculation } = useCalculationService();
  
  const [material, setMaterial] = useState('concrete');
  const [area, setArea] = useState<number>(0);
  const [complexity, setComplexity] = useState('simple');
  const [result, setResult] = useState<any>(null);

  const materialUnitCosts = {
    concrete: { price: 350, unit: 'm³' }, // R$ por m³
    brick: { price: 1.2, unit: 'unidade' }, // R$ por tijolo
    paint: { price: 20, unit: 'litro' }, // R$ por litro
    ceramic: { price: 40, unit: 'm²' }, // R$ por m²
    wood: { price: 120, unit: 'm²' }, // R$ por m²
  };

  const complexityFactors = {
    simple: 1,
    medium: 1.3,
    complex: 1.8,
  };

  const calculateCosts = () => {
    if (!area) return;

    let materialQuantity = 0;
    let materialTotal = 0;
    let laborTotal = 0;

    const factor = complexityFactors[complexity as keyof typeof complexityFactors];
    
    switch (material) {
      case 'concrete':
        materialQuantity = area * 0.15; // 15cm thickness
        materialTotal = materialQuantity * materialUnitCosts.concrete.price;
        laborTotal = materialTotal * 0.6 * factor;
        break;
        
      case 'brick':
        materialQuantity = area * 50; // 50 bricks per m²
        materialTotal = materialQuantity * materialUnitCosts.brick.price;
        laborTotal = area * 35 * factor;
        break;
        
      case 'paint':
        materialQuantity = area * 0.3; // 0.3L per m²
        materialTotal = materialQuantity * materialUnitCosts.paint.price;
        laborTotal = area * 15 * factor;
        break;
        
      case 'ceramic':
        materialQuantity = area * 1.1; // 10% waste
        materialTotal = materialQuantity * materialUnitCosts.ceramic.price;
        laborTotal = area * 45 * factor;
        break;
        
      case 'wood':
        materialQuantity = area;
        materialTotal = materialQuantity * materialUnitCosts.wood.price;
        laborTotal = area * 75 * factor;
        break;
    }
    
    const totalCost = materialTotal + laborTotal;
    
    setResult({
      materialQuantity,
      materialUnit: materialUnitCosts[material as keyof typeof materialUnitCosts].unit,
      materialTotal,
      laborTotal,
      totalCost,
      material,
      area,
      complexity
    });
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
    
    await saveCalculation({
      calculator_type: 'Estimativa de Custos',
      input_data: {
        material,
        area,
        complexity
      },
      result,
      name: `Custos de ${material} - ${area}m²`
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Estimativa de Custos</span>
        </CardTitle>
        <CardDescription>
          Calcule o custo aproximado de materiais e mão de obra
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Material</Label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concrete">Concreto</SelectItem>
              <SelectItem value="brick">Alvenaria (Tijolos)</SelectItem>
              <SelectItem value="paint">Pintura</SelectItem>
              <SelectItem value="ceramic">Revestimento Cerâmico</SelectItem>
              <SelectItem value="wood">Piso de Madeira</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            type="number"
            placeholder="Digite a área"
            min="0"
            step="0.01"
            onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label>Complexidade</Label>
          <Select value={complexity} onValueChange={setComplexity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simples</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="complex">Complexa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={calculateCosts} className="w-full">
          Calcular Custos
        </Button>

        {result && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Orçamento Estimado:</h3>
            <div className="space-y-2 text-green-800">
              <p>
                <strong>Material necessário:</strong> {result.materialQuantity.toFixed(2)} {result.materialUnit}
              </p>
              <p>
                <strong>Custo de material:</strong> {formatCurrency(result.materialTotal)}
              </p>
              <p>
                <strong>Custo de mão de obra:</strong> {formatCurrency(result.laborTotal)}
              </p>
              <div className="border-t border-green-200 mt-2 pt-2 font-bold">
                <p>Total: {formatCurrency(result.totalCost)}</p>
              </div>
            </div>
            <Button
              onClick={handleSaveCalculation}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Orçamento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
