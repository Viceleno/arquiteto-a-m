import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HardHat, Save, Calculator } from 'lucide-react';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const MaterialCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveCalculation } = useCalculationService();
  
  const [category, setCategory] = useState('flooring');
  const [inputs, setInputs] = useState<Record<string, number | string>>({});
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const updateInput = (key: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const calculateMaterial = () => {
    let calculation = {};
    
    switch (category) {
      case 'flooring':
        calculation = calculateFlooring();
        break;
      case 'painting':
        calculation = calculatePainting();
        break;
      case 'masonry':
        calculation = calculateMasonry();
        break;
      case 'roofing':
        calculation = calculateRoofing();
        break;
      case 'drywall':
        calculation = calculateDrywall();
        break;
      case 'lighting':
        calculation = calculateLighting();
        break;
      case 'ventilation':
        calculation = calculateVentilation();
        break;
      case 'stairs':
        calculation = calculateStairs();
        break;
      case 'ramps':
        calculation = calculateRamps();
        break;
      case 'parking':
        calculation = calculateParking();
        break;
      case 'rainwater':
        calculation = calculateRainwater();
        break;
      default:
        calculation = { error: 'Categoria não encontrada' };
    }
    
    setResult(calculation);
  };

  const calculateFlooring = () => {
    const area = Number(inputs.area) || 0;
    const pieceLength = Number(inputs.pieceLength) || 60;
    const pieceWidth = Number(inputs.pieceWidth) || 60;
    const groutWidth = Number(inputs.groutWidth) || 2;
    const wasteFactor = Number(inputs.wasteFactor) || 10;
    
    const pieceArea = (pieceLength * pieceWidth) / 10000; // cm² para m²
    const piecesNeeded = Math.ceil((area * (1 + wasteFactor/100)) / pieceArea);
    const boxSize = Number(inputs.boxSize) || 10;
    const boxes = Math.ceil(piecesNeeded / boxSize);
    
    // Argamassa (aprox. 3-5 kg/m²)
    const mortarKg = Math.ceil(area * 4);
    
    // Rejunte (aprox. 0.5-1 kg/m²)
    const groutKg = Math.ceil(area * 0.7);
    
    return {
      area: area.toFixed(2),
      piecesNeeded,
      boxes,
      mortarKg,
      groutKg,
      wasteFactor: wasteFactor + '%'
    };
  };

  const calculatePainting = () => {
    const wallArea = Number(inputs.wallArea) || 0;
    const coverage = Number(inputs.coverage) || 12; // m²/L
    const coats = Number(inputs.coats) || 2;
    const openings = Number(inputs.openings) || 0;
    
    const paintableArea = wallArea - openings;
    const paintNeeded = (paintableArea * coats) / coverage;
    const cans18L = Math.ceil(paintNeeded / 18);
    const gallons36L = Math.ceil(paintNeeded / 3.6);
    
    // Selador (se aplicável)
    const sealerNeeded = paintableArea / 10; // aprox. 10 m²/L
    
    return {
      paintableArea: paintableArea.toFixed(2),
      paintNeeded: paintNeeded.toFixed(2),
      cans18L,
      gallons36L,
      sealerNeeded: sealerNeeded.toFixed(2),
      coats
    };
  };

  const calculateMasonry = () => {
    const linearMeters = Number(inputs.linearMeters) || 0;
    const height = Number(inputs.height) || 2.7;
    const brickType = inputs.brickType || 'ceramic';
    
    const wallArea = linearMeters * height;
    let bricksPerM2 = 48; // tijolo cerâmico
    
    if (brickType === 'concrete') bricksPerM2 = 12.5; // bloco de concreto
    if (brickType === 'ceramic6holes') bricksPerM2 = 25; // tijolo 6 furos
    
    const totalBricks = Math.ceil(wallArea * bricksPerM2);
    const mortarVolume = wallArea * 0.02; // 2cm de espessura
    
    return {
      wallArea: wallArea.toFixed(2),
      totalBricks,
      mortarVolume: mortarVolume.toFixed(3),
      brickType
    };
  };

  const calculateRoofing = () => {
    const projectionArea = Number(inputs.projectionArea) || 0;
    const inclination = Number(inputs.inclination) || 30; // graus
    const tileType = inputs.tileType || 'ceramic';
    
    const realArea = projectionArea / Math.cos(inclination * Math.PI / 180);
    
    let tilesPerM2 = 16; // telha cerâmica
    if (tileType === 'concrete') tilesPerM2 = 10.5;
    if (tileType === 'fiber') tilesPerM2 = 5.1;
    if (tileType === 'metal') tilesPerM2 = 4;
    
    const totalTiles = Math.ceil(realArea * tilesPerM2 * 1.05); // 5% perda
    
    return {
      projectionArea: projectionArea.toFixed(2),
      realArea: realArea.toFixed(2),
      inclination: inclination + '°',
      totalTiles,
      tileType
    };
  };

  const calculateDrywall = () => {
    const area = Number(inputs.area) || 0;
    const spacing = Number(inputs.spacing) || 60; // cm
    
    const plates = Math.ceil(area / 3); // placa padrão 1,20 x 2,40m
    const studs = Math.ceil((area * 100) / (spacing * 240)); // montantes
    const tracks = Math.ceil(area / 2.4) * 2; // guias
    const screws = plates * 25; // parafusos por placa
    
    return {
      area: area.toFixed(2),
      plates,
      studs,
      tracks,
      screws,
      spacing: spacing + 'cm'
    };
  };

  const calculateLighting = () => {
    const roomArea = Number(inputs.roomArea) || 0;
    const windowArea = Number(inputs.windowArea) || 0;
    const orientation = inputs.orientation || 'north';
    
    const ratio = windowArea / roomArea;
    let assessment = 'Insuficiente';
    
    if (ratio >= 0.16) assessment = 'Excelente';
    else if (ratio >= 0.12) assessment = 'Boa';
    else if (ratio >= 0.08) assessment = 'Regular';
    
    let suggestion = '';
    if (orientation === 'south') suggestion = 'Considerar aumentar vãos - orientação sul recebe menos luz';
    if (orientation === 'north') suggestion = 'Orientação favorável para iluminação natural';
    
    return {
      roomArea: roomArea.toFixed(2),
      windowArea: windowArea.toFixed(2),
      ratio: (ratio * 100).toFixed(1) + '%',
      assessment,
      suggestion
    };
  };

  const calculateVentilation = () => {
    const volume = Number(inputs.volume) || 0;
    const ventArea = Number(inputs.ventArea) || 0;
    const floorArea = Number(inputs.floorArea) || 0;
    
    const ventRatio = ventArea / floorArea;
    let assessment = 'Insuficiente';
    
    if (ventRatio >= 0.08) assessment = 'Excelente';
    else if (ventRatio >= 0.05) assessment = 'Boa';
    else if (ventRatio >= 0.03) assessment = 'Regular';
    
    return {
      volume: volume.toFixed(2),
      ventArea: ventArea.toFixed(2),
      ventRatio: (ventRatio * 100).toFixed(1) + '%',
      assessment
    };
  };

  const calculateStairs = () => {
    const height = Number(inputs.height) || 0;
    const length = Number(inputs.length) || 0;
    
    // Fórmula de Blondel: 2h + p = 63-65cm
    const optimalRiser = 17; // cm
    const steps = Math.round(height * 100 / optimalRiser);
    const actualRiser = (height * 100) / steps;
    const tread = 65 - (2 * actualRiser);
    const totalLength = (steps - 1) * (tread / 100);
    
    let comfort = 'Confortável';
    if (actualRiser > 18 || actualRiser < 16) comfort = 'Fora do padrão de conforto';
    if (tread > 32 || tread < 28) comfort = 'Fora do padrão de conforto';
    
    return {
      height: height.toFixed(2) + 'm',
      steps,
      riser: actualRiser.toFixed(1) + 'cm',
      tread: tread.toFixed(1) + 'cm',
      totalLength: totalLength.toFixed(2) + 'm',
      comfort
    };
  };

  const calculateRamps = () => {
    const levelDiff = Number(inputs.levelDiff) || 0;
    const maxInclination = Number(inputs.maxInclination) || 8.33; // %
    
    const rampLength = (levelDiff * 100) / maxInclination;
    const platforms = Math.ceil(rampLength / 30) - 1; // patamar a cada 30m
    
    return {
      levelDiff: levelDiff.toFixed(2) + 'm',
      rampLength: rampLength.toFixed(2) + 'm',
      inclination: maxInclination + '%',
      platforms
    };
  };

  const calculateParking = () => {
    const totalLength = Number(inputs.totalLength) || 0;
    const totalWidth = Number(inputs.totalWidth) || 0;
    const spaceLength = Number(inputs.spaceLength) || 5;
    const spaceWidth = Number(inputs.spaceWidth) || 2.5;
    
    const totalArea = totalLength * totalWidth;
    const spaceArea = spaceLength * spaceWidth;
    const spaces = Math.floor((totalLength / spaceLength) * (totalWidth / spaceWidth));
    
    return {
      totalArea: totalArea.toFixed(2) + 'm²',
      estimatedSpaces: spaces,
      spaceSize: spaceLength + 'm x ' + spaceWidth + 'm'
    };
  };

  const calculateRainwater = () => {
    const roofArea = Number(inputs.roofArea) || 0;
    const rainfall = Number(inputs.rainfall) || 1500; // mm/ano
    
    const potential = roofArea * (rainfall / 1000) * 0.8; // 80% eficiência
    const monthlyPotential = potential / 12;
    
    return {
      roofArea: roofArea.toFixed(2) + 'm²',
      annualPotential: potential.toFixed(0) + 'L/ano',
      monthlyPotential: monthlyPotential.toFixed(0) + 'L/mês',
      rainfall: rainfall + 'mm/ano'
    };
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
      input_data: { category, inputs },
      result,
      name: `${getCategoryName(category)} - ${new Date().toLocaleDateString()}`
    });
  };

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      flooring: 'Pisos e Revestimentos',
      painting: 'Pintura',
      masonry: 'Alvenaria',
      roofing: 'Telhado',
      drywall: 'Drywall',
      lighting: 'Iluminação Natural',
      ventilation: 'Ventilação',
      stairs: 'Escadas',
      ramps: 'Rampas',
      parking: 'Vagas de Garagem',
      rainwater: 'Captação de Chuva'
    };
    return names[cat] || cat;
  };

  const renderInputs = () => {
    switch (category) {
      case 'flooring':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Área (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('area', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Fator de Perda (%)</Label>
                <Input type="number" defaultValue="10" onChange={(e) => updateInput('wasteFactor', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Comprimento da Peça (cm)</Label>
                <Input type="number" defaultValue="60" onChange={(e) => updateInput('pieceLength', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Largura da Peça (cm)</Label>
                <Input type="number" defaultValue="60" onChange={(e) => updateInput('pieceWidth', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Largura do Rejunte (mm)</Label>
                <Input type="number" defaultValue="2" onChange={(e) => updateInput('groutWidth', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Peças por Caixa</Label>
                <Input type="number" defaultValue="10" onChange={(e) => updateInput('boxSize', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      case 'painting':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Área das Paredes (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('wallArea', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Área de Vãos (m²)</Label>
                <Input type="number" defaultValue="0" onChange={(e) => updateInput('openings', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Rendimento (m²/L)</Label>
                <Input type="number" defaultValue="12" onChange={(e) => updateInput('coverage', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Número de Demãos</Label>
                <Input type="number" defaultValue="2" onChange={(e) => updateInput('coats', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      case 'masonry':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Metragem Linear (m)</Label>
                <Input type="number" onChange={(e) => updateInput('linearMeters', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Altura (m)</Label>
                <Input type="number" defaultValue="2.7" onChange={(e) => updateInput('height', parseFloat(e.target.value))} />
              </div>
              <div className="col-span-2">
                <Label>Tipo de Tijolo/Bloco</Label>
                <Select onValueChange={(value) => updateInput('brickType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceramic">Tijolo Cerâmico</SelectItem>
                    <SelectItem value="ceramic6holes">Tijolo 6 Furos</SelectItem>
                    <SelectItem value="concrete">Bloco de Concreto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case 'roofing':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Área de Projeção (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('projectionArea', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Inclinação (graus)</Label>
                <Input type="number" defaultValue="30" onChange={(e) => updateInput('inclination', parseFloat(e.target.value))} />
              </div>
              <div className="col-span-2">
                <Label>Tipo de Telha</Label>
                <Select onValueChange={(value) => updateInput('tileType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceramic">Cerâmica</SelectItem>
                    <SelectItem value="concrete">Concreto</SelectItem>
                    <SelectItem value="fiber">Fibrocimento</SelectItem>
                    <SelectItem value="metal">Metálica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case 'drywall':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Área (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('area', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Espaçamento Montantes (cm)</Label>
                <Input type="number" defaultValue="60" onChange={(e) => updateInput('spacing', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      case 'lighting':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Área do Ambiente (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('roomArea', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Área das Janelas (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('windowArea', parseFloat(e.target.value))} />
              </div>
              <div className="col-span-2">
                <Label>Orientação Solar</Label>
                <Select onValueChange={(value) => updateInput('orientation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">Norte</SelectItem>
                    <SelectItem value="south">Sul</SelectItem>
                    <SelectItem value="east">Leste</SelectItem>
                    <SelectItem value="west">Oeste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case 'ventilation':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Volume do Ambiente (m³)</Label>
                <Input type="number" onChange={(e) => updateInput('volume', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Área de Ventilação (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('ventArea', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Área do Piso (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('floorArea', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      case 'stairs':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Pé-direito a Vencer (m)</Label>
                <Input type="number" onChange={(e) => updateInput('height', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Comprimento Disponível (m)</Label>
                <Input type="number" onChange={(e) => updateInput('length', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      case 'ramps':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Desnível a Vencer (m)</Label>
                <Input type="number" onChange={(e) => updateInput('levelDiff', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Inclinação Máxima (%)</Label>
                <Input type="number" defaultValue="8.33" onChange={(e) => updateInput('maxInclination', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      case 'parking':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Comprimento Total (m)</Label>
                <Input type="number" onChange={(e) => updateInput('totalLength', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Largura Total (m)</Label>
                <Input type="number" onChange={(e) => updateInput('totalWidth', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Comprimento da Vaga (m)</Label>
                <Input type="number" defaultValue="5" onChange={(e) => updateInput('spaceLength', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Largura da Vaga (m)</Label>
                <Input type="number" defaultValue="2.5" onChange={(e) => updateInput('spaceWidth', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      case 'rainwater':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Área do Telhado (m²)</Label>
                <Input type="number" onChange={(e) => updateInput('roofArea', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Índice Pluviométrico (mm/ano)</Label>
                <Input type="number" defaultValue="1500" onChange={(e) => updateInput('rainfall', parseFloat(e.target.value))} />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className="space-y-2">
        {Object.entries(result).map(([key, value]) => (
          <p key={key}>
            <strong>{formatLabel(key)}:</strong> {String(value)}
          </p>
        ))}
      </div>
    );
  };

  const formatLabel = (key: string) => {
    const labels: Record<string, string> = {
      area: 'Área',
      piecesNeeded: 'Peças necessárias',
      boxes: 'Caixas',
      mortarKg: 'Argamassa (kg)',
      groutKg: 'Rejunte (kg)',
      wasteFactor: 'Fator de perda',
      paintableArea: 'Área pintável',
      paintNeeded: 'Tinta necessária (L)',
      cans18L: 'Latas 18L',
      gallons36L: 'Galões 3,6L',
      sealerNeeded: 'Selador (L)',
      coats: 'Demãos',
      wallArea: 'Área da parede',
      totalBricks: 'Tijolos/blocos',
      mortarVolume: 'Argamassa (m³)',
      brickType: 'Tipo',
      projectionArea: 'Área de projeção',
      realArea: 'Área real',
      inclination: 'Inclinação',
      totalTiles: 'Telhas',
      tileType: 'Tipo de telha',
      plates: 'Placas',
      studs: 'Montantes',
      tracks: 'Guias',
      screws: 'Parafusos',
      spacing: 'Espaçamento',
      roomArea: 'Área do ambiente',
      windowArea: 'Área das janelas',
      ratio: 'Proporção janela/piso',
      assessment: 'Avaliação',
      suggestion: 'Sugestão',
      volume: 'Volume',
      ventArea: 'Área de ventilação',
      ventRatio: 'Proporção ventilação/piso',
      height: 'Altura',
      steps: 'Degraus',
      riser: 'Altura do espelho',
      tread: 'Largura do piso',
      totalLength: 'Comprimento total',
      comfort: 'Conforto',
      levelDiff: 'Desnível',
      rampLength: 'Comprimento da rampa',
      platforms: 'Patamares necessários',
      totalArea: 'Área total',
      estimatedSpaces: 'Vagas estimadas',
      spaceSize: 'Tamanho da vaga',
      roofArea: 'Área do telhado',
      annualPotential: 'Potencial anual',
      monthlyPotential: 'Potencial mensal',
      rainfall: 'Pluviometria'
    };
    return labels[key] || key;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HardHat className="w-5 h-5" />
          <span>Calculadora de Materiais e Dimensionamento</span>
        </CardTitle>
        <CardDescription>
          Cálculos detalhados para arquitetura e construção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Categoria de Cálculo</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flooring">Pisos e Revestimentos</SelectItem>
              <SelectItem value="painting">Pintura</SelectItem>
              <SelectItem value="masonry">Alvenaria</SelectItem>
              <SelectItem value="roofing">Telhado Inclinado</SelectItem>
              <SelectItem value="drywall">Drywall</SelectItem>
              <SelectItem value="lighting">Iluminação Natural</SelectItem>
              <SelectItem value="ventilation">Ventilação</SelectItem>
              <SelectItem value="stairs">Escadas</SelectItem>
              <SelectItem value="ramps">Rampas</SelectItem>
              <SelectItem value="parking">Vagas de Garagem</SelectItem>
              <SelectItem value="rainwater">Captação de Chuva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderInputs()}

        <Button onClick={calculateMaterial} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular
        </Button>

        {result && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">
              Resultado - {getCategoryName(category)}:
            </h3>
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
