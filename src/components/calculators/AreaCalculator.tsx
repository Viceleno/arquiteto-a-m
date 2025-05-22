
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Save } from 'lucide-react';

interface AreaResult {
  shape: string;
  dimensions: Record<string, number>;
  area: number;
  unit: string;
  timestamp: Date;
}

export const AreaCalculator = () => {
  const [shape, setShape] = useState('rectangle');
  const [dimensions, setDimensions] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [unit, setUnit] = useState('m²');

  const calculateArea = () => {
    let area = 0;
    
    switch (shape) {
      case 'rectangle':
        area = (dimensions.width || 0) * (dimensions.height || 0);
        break;
      case 'circle':
        area = Math.PI * Math.pow(dimensions.radius || 0, 2);
        break;
      case 'triangle':
        area = ((dimensions.base || 0) * (dimensions.height || 0)) / 2;
        break;
      default:
        area = 0;
    }
    
    setResult(area);
  };

  const saveCalculation = () => {
    const calculation: AreaResult = {
      shape,
      dimensions,
      area: result || 0,
      unit,
      timestamp: new Date()
    };
    
    // Salvar no localStorage para histórico
    const history = JSON.parse(localStorage.getItem('archiCalc_history') || '[]');
    history.unshift(calculation);
    localStorage.setItem('archiCalc_history', JSON.stringify(history.slice(0, 50)));
    
    console.log('Cálculo salvo:', calculation);
  };

  const renderInputs = () => {
    switch (shape) {
      case 'rectangle':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="width">Largura (m)</Label>
              <Input
                id="width"
                type="number"
                placeholder="Digite a largura"
                onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (m)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Digite a altura"
                onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0})}
              />
            </div>
          </>
        );
      case 'circle':
        return (
          <div className="space-y-2">
            <Label htmlFor="radius">Raio (m)</Label>
            <Input
              id="radius"
              type="number"
              placeholder="Digite o raio"
              onChange={(e) => setDimensions({...dimensions, radius: parseFloat(e.target.value) || 0})}
            />
          </div>
        );
      case 'triangle':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="base">Base (m)</Label>
              <Input
                id="base"
                type="number"
                placeholder="Digite a base"
                onChange={(e) => setDimensions({...dimensions, base: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="triangleHeight">Altura (m)</Label>
              <Input
                id="triangleHeight"
                type="number"
                placeholder="Digite a altura"
                onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0})}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <span>Calculadora de Área</span>
        </CardTitle>
        <CardDescription>
          Calcule a área de diferentes formas geométricas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Forma Geométrica</Label>
          <Select value={shape} onValueChange={setShape}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rectangle">Retângulo/Quadrado</SelectItem>
              <SelectItem value="circle">Círculo</SelectItem>
              <SelectItem value="triangle">Triângulo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderInputs()}

        <Button onClick={calculateArea} className="w-full">
          Calcular Área
        </Button>

        {result !== null && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900">Resultado:</h3>
            <p className="text-2xl font-bold text-blue-700">
              {result.toFixed(2)} {unit}
            </p>
            <Button
              onClick={saveCalculation}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar no Histórico
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
