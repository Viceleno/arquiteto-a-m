
import React from 'react';
import { CalculatorCard } from '@/components/CalculatorCard';
import { 
  Calculator, 
  HardHat,
  Ruler,
  DollarSign
} from 'lucide-react';

const calculators = [
  {
    id: 'area',
    title: 'Cálculo de Área e Volume',
    description: 'Calcule áreas e volumes de diferentes formas geométricas',
    icon: Ruler,
    color: 'bg-blue-500',
    category: 'Medidas e Cálculos'
  },
  {
    id: 'materials',
    title: 'Estimativa de Materiais',
    description: 'Concreto, tijolos, argamassa, iluminação, telhado e mais',
    icon: HardHat,
    color: 'bg-orange-500',
    category: 'Materiais'
  },
  {
    id: 'costs',
    title: 'Estimativa de Custos',
    description: 'Orçamento detalhado com campos específicos por material',
    icon: DollarSign,
    color: 'bg-emerald-500',
    category: 'Orçamento'
  }
];

export const CalculatorGrid = () => {
  const categories = [...new Set(calculators.map(calc => calc.category))];

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators
              .filter(calc => calc.category === category)
              .map(calculator => (
                <CalculatorCard key={calculator.id} calculator={calculator} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
