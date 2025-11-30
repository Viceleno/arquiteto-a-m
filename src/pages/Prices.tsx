import React, { useState, useMemo } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  Search, 
  RotateCcw, 
  Save, 
  Info,
  Package,
  Paintbrush,
  Lightbulb,
  Home,
  Hammer,
  Layers
} from 'lucide-react';
import { usePrices } from '@/context/PriceContext';
import { materialsDatabase } from '@/components/calculators/cost/CostCalculatorTypes';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const materialIcons: Record<string, React.ReactNode> = {
  concrete: <Layers className="w-5 h-5" />,
  brick: <Package className="w-5 h-5" />,
  paint: <Paintbrush className="w-5 h-5" />,
  ceramic: <Home className="w-5 h-5" />,
  wood: <Hammer className="w-5 h-5" />,
  lighting: <Lightbulb className="w-5 h-5" />,
  roofing: <Home className="w-5 h-5" />,
};

const PriceCard: React.FC<{
  materialKey: string;
  compositionIndex: number;
  compositionName: string;
  unit: string;
  currentPrice: number;
  defaultPrice: number;
  onPriceChange: (newPrice: number) => void;
}> = ({ compositionName, unit, currentPrice, defaultPrice, onPriceChange }) => {
  const [localPrice, setLocalPrice] = useState(currentPrice.toString());
  const [isDirty, setIsDirty] = useState(false);
  const isModified = currentPrice !== defaultPrice;

  const handleBlur = () => {
    const newPrice = parseFloat(localPrice);
    if (!isNaN(newPrice) && newPrice !== currentPrice) {
      onPriceChange(newPrice);
      setIsDirty(false);
    }
  };

  const handleChange = (value: string) => {
    setLocalPrice(value);
    setIsDirty(true);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">{compositionName}</p>
          {isModified && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              Personalizado
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Unidade: {unit} | Padrão: R$ {defaultPrice.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
          <Input
            type="number"
            value={localPrice}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            step="0.01"
            min="0"
            className="w-28 pl-9 h-10"
          />
        </div>
        {isDirty && (
          <Button size="sm" onClick={handleBlur}>
            <Save className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const Prices: React.FC = () => {
  const { priceItems, loading, updatePrice, resetToDefaults } = usePrices();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const materialOptions = useMemo(() => {
    return Object.entries(materialsDatabase).map(([key, data]) => ({
      key,
      name: data.name,
      icon: materialIcons[key] || <Package className="w-5 h-5" />,
    }));
  }, []);

  const filteredItems = useMemo(() => {
    let items = priceItems;

    // Filtrar por material
    if (activeTab !== 'all') {
      items = items.filter(item => item.materialKey === activeTab);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.compositionName.toLowerCase().includes(term) ||
        materialsDatabase[item.materialKey]?.name.toLowerCase().includes(term)
      );
    }

    return items;
  }, [priceItems, activeTab, searchTerm]);

  const modifiedCount = useMemo(() => {
    return priceItems.filter(item => item.unitPrice !== item.defaultPrice).length;
  }, [priceItems]);

  const handlePriceChange = async (materialKey: string, compositionIndex: number, newPrice: number) => {
    await updatePrice(materialKey, compositionIndex, newPrice);
  };

  const handleResetAll = async () => {
    await resetToDefaults();
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="max-w-6xl mx-auto space-y-6 p-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-primary">Gestão de Preços</CardTitle>
                  <CardDescription className="text-base">
                    Configure os preços unitários dos materiais e insumos
                  </CardDescription>
                </div>
              </div>
              {modifiedCount > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Resetar Tudo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Resetar todos os preços?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá restaurar todos os {modifiedCount} preços modificados para os valores padrão. 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetAll}>
                        Confirmar Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            {/* Info Box */}
            <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Como funciona:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Os preços configurados aqui serão usados em todos os cálculos de custo</li>
                  <li>• Preços personalizados são salvos automaticamente na sua conta</li>
                  <li>• Use o botão "Resetar" para voltar aos valores padrão</li>
                </ul>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar material ou insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{filteredItems.length} itens encontrados</span>
              {modifiedCount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  {modifiedCount} preços personalizados
                </Badge>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Todos
                </TabsTrigger>
                {materialOptions.map(material => (
                  <TabsTrigger 
                    key={material.key} 
                    value={material.key}
                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {material.icon}
                    {material.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-3">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum item encontrado</p>
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <PriceCard
                        key={`${item.materialKey}_${item.compositionIndex}`}
                        materialKey={item.materialKey}
                        compositionIndex={item.compositionIndex}
                        compositionName={item.compositionName}
                        unit={item.unit}
                        currentPrice={item.unitPrice}
                        defaultPrice={item.defaultPrice}
                        onPriceChange={(newPrice) => handlePriceChange(item.materialKey, item.compositionIndex, newPrice)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default Prices;
