
import React from 'react';
import { CalculatorCard } from '@/components/CalculatorCard';
import { 
  Calculator, 
  Home, 
  Box, // Replace 'Cube' with 'Box'
  Palette, 
  HardHat,
  Ruler, // Replace 'Rulers' with 'Ruler'
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';

const calculators = [
  {
    id: 'area',
    title: 'Cálculo de Área',
    description: 'Calcule áreas de diferentes formas geométricas',
    icon: Ruler,
    color: 'bg-blue-500',
    category: 'Medidas'
  },
  {
    id: 'volume',
    title: 'Cálculo de Volume',
    description: 'Volume de ambientes e estruturas',
    icon: Box,
    color: 'bg-green-500',
    category: 'Medidas'
  },
  {
    id: 'materials',
    title: 'Estimativa de Materiais',
    description: 'Concreto, tijolos, argamassa e mais',
    icon: HardHat,
    color: 'bg-orange-500',
    category: 'Materiais'
  },
  {
    id: 'paint',
    title: 'Cálculo de Tinta',
    description: 'Quantidade de tinta necessária',
    icon: Palette,
    color: 'bg-purple-500',
    category: 'Materiais'
  },
  {
    id: 'conversions',
    title: 'Conversões de Unidades',
    description: 'Metros, pés, polegadas e mais',
    icon: ArrowRightLeft,
    color: 'bg-indigo-500',
    category: 'Conversões'
  },
  {
    id: 'costs',
    title: 'Estimativa de Custos',
    description: 'Orçamento básico de materiais',
    icon: DollarSign,
    color: 'bg-emerald-500',
    category: 'Custos'
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
