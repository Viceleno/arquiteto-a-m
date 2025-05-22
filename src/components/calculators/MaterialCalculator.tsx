
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HardHat, Save } from 'lucide-react';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const MaterialCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveCalculation } = useCalculationService();
  
  const [material, setMaterial] = useState('concrete');
  const [area, setArea] = useState(0);
  const [thickness, setThickness] = useState(0);
  const [result, setResult] = useState<any>(null);

  const calculateMaterial = () => {
    let calculation = {};
    
    switch (material) {
      case 'concrete':
        const volume = area * (thickness / 100); // thickness em cm para m
        const cementBags = Math.ceil(volume * 7); // aproximadamente 7 sacos por m³
        const sand = volume * 0.6; // m³ de areia
        const gravel = volume * 0.9; // m³ de brita
        
        calculation = {
          volume: volume.toFixed(2),
          cementBags,
          sand: sand.toFixed(2),
          gravel: gravel.toFixed(2),
          unit: 'm³'
        };
        break;
        
      case 'bricks':
        const bricksPerM2 = 48; // tijolos por m²
        const totalBricks = Math.ceil(area * bricksPerM2);
        const mortarVolume = area * 0.02; // 2cm de argamassa
        
        calculation = {
          totalBricks,
          mortarVolume: mortarVolume.toFixed(2),
          unit: 'unidades'
        };
        break;
        
      case 'tiles':
        const tilesPerM2 = 16; // assumindo azulejos 25x25cm
        const totalTiles = Math.ceil(area * tilesPerM2 * 1.1); // 10% extra
        
        calculation = {
          totalTiles,
          area: area.toFixed(2),
          unit: 'unidades'
        };
        break;
    }
    
    setResult(calculation);
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
    
    if (!result) return;
    
    await saveCalculation({
      calculator_type: 'Cálculo de Materiais',
      input_data: { material, area, thickness },
      result,
      name: `Material: ${material} - ${area}m²`
    });
  };

  const renderMaterialInputs = () => {
    switch (material) {
      case 'concrete':
        return (
          <div className="space-y-2">
            <Label htmlFor="thickness">Espessura (cm)</Label>
            <Input
              id="thickness"
              type="number"
              placeholder="Ex: 10"
              onChange={(e) => setThickness(parseFloat(e.target.value) || 0)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!result) return null;

    switch (material) {
      case 'concrete':
        return (
          <div className="space-y-2">
            <p><strong>Volume de concreto:</strong> {result.volume} m³</p>
            <p><strong>Sacos de cimento:</strong> {result.cementBags} sacos (50kg)</p>
            <p><strong>Areia:</strong> {result.sand} m³</p>
            <p><strong>Brita:</strong> {result.gravel} m³</p>
          </div>
        );
      case 'bricks':
        return (
          <div className="space-y-2">
            <p><strong>Tijolos necessários:</strong> {result.totalBricks} unidades</p>
            <p><strong>Argamassa:</strong> {result.mortarVolume} m³</p>
          </div>
        );
      case 'tiles':
        return (
          <div className="space-y-2">
            <p><strong>Azulejos necessários:</strong> {result.totalTiles} unidades</p>
            <p><strong>Área a cobrir:</strong> {result.area} m²</p>
            <small className="text-gray-600">*Inclui 10% para perdas</small>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HardHat className="w-5 h-5" />
          <span>Calculadora de Materiais</span>
        </CardTitle>
        <CardDescription>
          Estime a quantidade de materiais necessários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo de Material</Label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concrete">Concreto</SelectItem>
              <SelectItem value="bricks">Tijolos</SelectItem>
              <SelectItem value="tiles">Azulejos/Cerâmica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            type="number"
            placeholder="Digite a área"
            onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
          />
        </div>

        {renderMaterialInputs()}

        <Button onClick={calculateMaterial} className="w-full">
          Calcular Materiais
        </Button>

        {result && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Resultado:</h3>
            <div className="text-green-800">
              {renderResults()}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={saveMaterialCalculation}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Cálculo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
