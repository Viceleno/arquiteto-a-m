
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCalculationService } from '@/services/calculationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Save, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AreaResult {
  shape: string;
  dimensions: Record<string, number>;
  area: number;
  volume?: number;
  unit: string;
  timestamp: Date;
}

const SHAPE_EXAMPLES: Record<string, { desc: string; formulaArea: string; formulaVolume?: string; sample: string }> = {
  rectangle: {
    desc:
      'Ideal para cômodos (quartos, salas) e superfícies retangulares. Use largura e altura em metros.',
    formulaArea: 'Área = largura × altura',
    formulaVolume: 'Volume = largura × altura × profundidade',
    sample:
      'Exemplo: 4m (largura) × 5m (altura) = 20m² (área). Se profundidade de 2,5m, então 20m² × 2,5m = 50m³ (volume).',
  },
  circle: {
    desc:
      'Para áreas circulares como lajes ou floreiras redondas. Use o raio em metros.',
    formulaArea: 'Área = π × raio²',
    formulaVolume: 'Volume = π × raio² × altura',
    sample:
      'Exemplo: raio de 2m → π × 2² = 12,57m². Se altura 3m, então 12,57m² × 3m = 37,70m³.',
  },
  triangle: {
    desc:
      'Indicado para terrenos ou partes de lajes triangulares. Use base e altura em metros.',
    formulaArea: 'Área = (base × altura) ÷ 2',
    formulaVolume: 'Volume = (base × altura ÷ 2) × profundidade',
    sample:
      'Exemplo: base 6m, altura 4m → (6 × 4) ÷ 2 = 12m². Com profundidade 2m: 12m² × 2m = 24m³.',
  },
};

export const AreaCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveCalculation } = useCalculationService();

  // Estados
  const [shape, setShape] = useState<'rectangle' | 'circle' | 'triangle'>('rectangle');
  const [dimensions, setDimensions] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ area: number; volume?: number } | null>(null);
  const [unit, setUnit] = useState('m²');
  const [calcVolume, setCalcVolume] = useState(false);

  // Cálculo
  const calculate = () => {
    let area = 0;
    let volume: number | undefined = undefined;

    switch (shape) {
      case 'rectangle':
        area = (dimensions.width || 0) * (dimensions.height || 0);
        if (calcVolume && dimensions.depth) {
          volume = area * (dimensions.depth || 0);
        }
        break;
      case 'circle':
        area = Math.PI * Math.pow(dimensions.radius || 0, 2);
        if (calcVolume && dimensions.height) {
          volume = area * (dimensions.height || 0);
        }
        break;
      case 'triangle':
        area = ((dimensions.base || 0) * (dimensions.height || 0)) / 2;
        if (calcVolume && dimensions.depth) {
          volume = area * (dimensions.depth || 0);
        }
        break;
      default:
        area = 0;
    }

    setResult({ area, volume });
  };

  // Salvar
  const handleSave = async () => {
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
      calculator_type: 'Cálculo de Área e Volume',
      input_data: { shape, dimensions, calcVolume },
      result: { area: result.area, volume: result.volume, unit: calcVolume ? 'm³' : 'm²' },
      name: `Área/Volume ${shape} - ${calcVolume && result.volume ? result.volume.toFixed(2)+'m³' : result.area.toFixed(2)+'m²'}`
    });
    toast({ title: "Salvo!", description: "Cálculo salvo no histórico." });
  };

  // Renderização dos inputs
  const renderInputs = () => {
    const InputAsterisk = () => (
      <Asterisk className="w-3 h-3 inline text-red-500 -mt-1 ml-0.5" strokeWidth={3} />
    );
    switch (shape) {
      case 'rectangle':
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="width">
                Largura (m) <InputAsterisk />
              </Label>
              <Input
                id="width"
                min={0}
                step="any"
                type="number"
                required
                placeholder="Ex: 5"
                value={dimensions.width === undefined ? '' : dimensions.width}
                onChange={(e) =>
                  setDimensions((old) => ({
                    ...old,
                    width: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">Informe a largura em metros</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="height">
                Altura (m) <InputAsterisk />
              </Label>
              <Input
                id="height"
                min={0}
                step="any"
                type="number"
                required
                placeholder="Ex: 3.2"
                value={dimensions.height === undefined ? '' : dimensions.height}
                onChange={(e) =>
                  setDimensions((old) => ({
                    ...old,
                    height: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">Informe a altura em metros</p>
            </div>
            {calcVolume && (
              <div className="space-y-1">
                <Label htmlFor="depth">
                  Profundidade (m) <InputAsterisk />
                </Label>
                <Input
                  id="depth"
                  min={0}
                  step="any"
                  type="number"
                  required
                  placeholder="Ex: 2.5"
                  value={dimensions.depth === undefined ? '' : dimensions.depth}
                  onChange={(e) =>
                    setDimensions((old) => ({
                      ...old,
                      depth: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">Informe a profundidade para calcular o volume</p>
              </div>
            )}
          </>
        );
      case 'circle':
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="radius">
                Raio (m) <InputAsterisk />
              </Label>
              <Input
                id="radius"
                min={0}
                step="any"
                type="number"
                required
                placeholder="Ex: 2"
                value={dimensions.radius === undefined ? '' : dimensions.radius}
                onChange={(e) =>
                  setDimensions((old) => ({
                    ...old,
                    radius: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">Distância do centro até a borda, em metros</p>
            </div>
            {calcVolume && (
              <div className="space-y-1">
                <Label htmlFor="height">
                  Altura do cilindro (m) <InputAsterisk />
                </Label>
                <Input
                  id="height"
                  min={0}
                  step="any"
                  type="number"
                  required
                  placeholder="Ex: 1.5"
                  value={dimensions.height === undefined ? '' : dimensions.height}
                  onChange={(e) =>
                    setDimensions((old) => ({
                      ...old,
                      height: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">Informe a altura do cilindro para calcular o volume</p>
              </div>
            )}
          </>
        );
      case 'triangle':
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="base">
                Base (m) <InputAsterisk />
              </Label>
              <Input
                id="base"
                min={0}
                step="any"
                type="number"
                required
                placeholder="Ex: 6"
                value={dimensions.base === undefined ? '' : dimensions.base}
                onChange={(e) =>
                  setDimensions((old) => ({
                    ...old,
                    base: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">Informe a base do triângulo</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="height">
                Altura (m) <InputAsterisk />
              </Label>
              <Input
                id="height"
                min={0}
                step="any"
                type="number"
                required
                placeholder="Ex: 4"
                value={dimensions.height === undefined ? '' : dimensions.height}
                onChange={(e) =>
                  setDimensions((old) => ({
                    ...old,
                    height: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">Distância perpendicular da base ao topo</p>
            </div>
            {calcVolume && (
              <div className="space-y-1">
                <Label htmlFor="depth">
                  Profundidade (m) <InputAsterisk />
                </Label>
                <Input
                  id="depth"
                  min={0}
                  step="any"
                  type="number"
                  required
                  placeholder="Ex: 2"
                  value={dimensions.depth === undefined ? '' : dimensions.depth}
                  onChange={(e) =>
                    setDimensions((old) => ({
                      ...old,
                      depth: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">Informe a profundidade para calcular o volume</p>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  // Reset campos quando muda forma
  React.useEffect(() => {
    setDimensions({});
    setResult(null);
    setUnit(calcVolume ? 'm³' : 'm²');
  }, [shape, calcVolume]);

  // Renderização principal
  return (
    <Card className="max-w-lg mx-auto animate-fade-in border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-blue-700">
          <Calculator className="w-5 h-5" />
          <span>Calculadora de Área e Volume</span>
        </CardTitle>
        <CardDescription>
          Calcule de forma detalhada a área <b>e volume</b> de formas planas com exemplos, fórmulas e dicas didáticas.
        </CardDescription>
      </CardHeader>

      {/* Seção explicativa */}
      <CardContent className="pb-4">
        <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2">Como funciona?</h4>
          <ul className="list-disc text-gray-900 ml-5 space-y-1 text-sm">
            <li>Escolha a <b>forma geométrica</b> ⬇️</li>
            <li>Preencha todos os campos marcados com <Asterisk className="inline w-3 h-3 text-red-500" strokeWidth={3}/> (obrigatórios)</li>
            <li>Para volume, ative a opção e preencha a <b>profundidade</b> ou <b>altura</b> correspondente</li>
          </ul>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label>Forma Geométrica <Asterisk className="inline w-3 h-3 text-red-500" strokeWidth={3}/></Label>
            <Select
              value={shape}
              onValueChange={(v) => setShape(v as 'rectangle' | 'circle' | 'triangle')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Retângulo/Quadrado</SelectItem>
                <SelectItem value="circle">Círculo</SelectItem>
                <SelectItem value="triangle">Triângulo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex items-end gap-2">
            <Switch
              id="calc-volume"
              checked={calcVolume}
              onCheckedChange={setCalcVolume}
            />
            <Label htmlFor="calc-volume" className="mb-1 cursor-pointer">Calcular Volume?</Label>
          </div>
        </div>
        {/* Explicação e fórmulas para a forma */}
        <div className="bg-blue-100/60 rounded-md px-4 py-2 mt-3">
          <span className="font-semibold text-blue-800">Exemplo & fórmula:</span>
          <div className="text-sm text-blue-900 mt-1">
            <p className="mb-1"><b>Descrição:</b> {SHAPE_EXAMPLES[shape].desc}</p>
            <p>
              <b>Fórmula da área:</b>{" "}
              <span className="font-mono">{SHAPE_EXAMPLES[shape].formulaArea}</span>
            </p>
            {calcVolume && SHAPE_EXAMPLES[shape].formulaVolume && (
              <p>
                <b>Fórmula do volume:</b>{" "}
                <span className="font-mono">{SHAPE_EXAMPLES[shape].formulaVolume}</span>
              </p>
            )}
            <p className="mt-1"><b>Exemplo:</b> {SHAPE_EXAMPLES[shape].sample}</p>
          </div>
        </div>
      </CardContent>

      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); calculate(); }}>
          {renderInputs()}
          <Button type="submit" className={cn("w-full", "mt-4")}>
            Calcular {calcVolume ? "Área e Volume" : "Área"}
          </Button>
        </form>

        {result && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Resultado:</h3>
            <ul className="text-blue-900 space-y-1">
              <li>
                <b>Área:</b>{" "}
                <span className="text-2xl font-bold text-blue-700">
                  {result.area.toFixed(2)} m²
                </span>
              </li>
              {calcVolume && typeof result.volume === "number" && (
                <li>
                  <b>Volume:</b>{" "}
                  <span className="text-2xl font-bold text-emerald-700">
                    {result.volume.toFixed(2)} m³
                  </span>
                </li>
              )}
            </ul>
            <div className="text-xs text-muted-foreground mt-2">
              As fórmulas utilizadas estão descritas acima. Para precisão, utilize todas as casas decimais necessárias.
            </div>
            <Button
              onClick={handleSave}
              variant="outline"
              size="sm"
              className="mt-3"
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
