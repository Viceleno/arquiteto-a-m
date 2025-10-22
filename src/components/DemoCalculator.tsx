import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Sparkles, ArrowRight } from 'lucide-react';

export const DemoCalculator = () => {
  const [shape, setShape] = useState<'rectangle' | 'circle' | 'triangle'>('rectangle');
  const [dimensions, setDimensions] = useState({
    width: 4,
    height: 3,
    radius: 2,
    base: 5,
  });
  const [result, setResult] = useState<number | null>(null);

  const calculateArea = () => {
    let area = 0;
    switch (shape) {
      case 'rectangle':
        area = dimensions.width * dimensions.height;
        break;
      case 'circle':
        area = Math.PI * Math.pow(dimensions.radius, 2);
        break;
      case 'triangle':
        area = (dimensions.base * dimensions.height) / 2;
        break;
    }
    setResult(area);
  };

  const getShapeLabel = () => {
    switch (shape) {
      case 'rectangle': return 'Retângulo';
      case 'circle': return 'Círculo';
      case 'triangle': return 'Triângulo';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          Experimente Agora!
        </CardTitle>
        <CardDescription className="text-gray-600">
          Teste nossa calculadora de área gratuitamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Forma Geométrica</Label>
            <Select value={shape} onValueChange={(v) => setShape(v as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Retângulo</SelectItem>
                <SelectItem value="circle">Círculo</SelectItem>
                <SelectItem value="triangle">Triângulo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shape === 'rectangle' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Largura (m)</Label>
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Altura (m)</Label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {shape === 'circle' && (
            <div>
              <Label className="text-sm font-medium">Raio (m)</Label>
              <Input
                type="number"
                value={dimensions.radius}
                onChange={(e) => setDimensions(prev => ({ ...prev, radius: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          )}

          {shape === 'triangle' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Base (m)</Label>
                <Input
                  type="number"
                  value={dimensions.base}
                  onChange={(e) => setDimensions(prev => ({ ...prev, base: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Altura (m)</Label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <Button 
            onClick={calculateArea} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calcular Área
          </Button>

          {result !== null && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {result.toFixed(2)} m²
                </div>
                <div className="text-sm text-green-600">
                  Área do {getShapeLabel()}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
            <span>Esta é apenas uma demonstração</span>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400">
              Cadastre-se para acessar todas as calculadoras profissionais
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
