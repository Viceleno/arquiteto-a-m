import { LucideIcon, Ruler, HardHat, DollarSign } from 'lucide-react';

export interface CalculatorConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: string;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  timeEstimate: string;
  example: string;
  popularity: number;
  features: string[];
  useCase: string;
  route: string;
  db_key: string;
}

export const calculatorRegistry: CalculatorConfig[] = [
  {
    id: 'area',
    title: 'Cálculo de Área e Volume',
    description: 'Calcule áreas e volumes de diferentes formas geométricas',
    icon: Ruler,
    color: 'bg-blue-500',
    category: 'Medidas e Cálculos',
    difficulty: 'Fácil',
    timeEstimate: '2-5 min',
    example: 'Quarto 4x3m = 12m²',
    popularity: 95,
    features: ['Retângulo', 'Círculo', 'Triângulo', 'Volume 3D'],
    useCase: 'Ideal para dimensionamento de ambientes e cálculo de materiais',
    route: '/calculators/area',
    db_key: 'area'
  },
  {
    id: 'materials',
    title: 'Estimativa de Materiais',
    description: 'Concreto, tijolos, argamassa, iluminação, telhado e mais',
    icon: HardHat,
    color: 'bg-orange-500',
    category: 'Materiais',
    difficulty: 'Médio',
    timeEstimate: '5-10 min',
    example: 'Casa 100m² = 15m³ concreto',
    popularity: 88,
    features: ['Concreto', 'Tijolos', 'Argamassa', 'Iluminação'],
    useCase: 'Perfeito para orçamentos e compras de materiais',
    route: '/calculators/materials',
    db_key: 'materials'
  },
  {
    id: 'costs',
    title: 'Estimativa de Custos',
    description: 'Orçamento detalhado com campos específicos por material',
    icon: DollarSign,
    color: 'bg-emerald-500',
    category: 'Orçamento',
    difficulty: 'Avançado',
    timeEstimate: '10-15 min',
    example: 'Projeto completo = R$ 50.000',
    popularity: 92,
    features: ['BDI', 'Mão de Obra', 'Materiais', 'Complexidade'],
    useCase: 'Essencial para propostas comerciais e controle de custos',
    route: '/calculators/costs',
    db_key: 'costs'
  }
];

// Funções auxiliares
export const getCalculatorById = (id: string): CalculatorConfig | undefined => {
  return calculatorRegistry.find(calc => calc.id === id);
};

export const getCalculatorByDbKey = (dbKey: string): CalculatorConfig | undefined => {
  return calculatorRegistry.find(calc => calc.db_key === dbKey);
};

export const getCalculatorsByCategory = (category: string): CalculatorConfig[] => {
  return calculatorRegistry.filter(calc => calc.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(calculatorRegistry.map(calc => calc.category))];
};

export const getDifficultyColor = (difficulty: CalculatorConfig['difficulty']) => {
  switch (difficulty) {
    case 'Fácil': return 'bg-green-100 text-green-700 border-green-200';
    case 'Médio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Avançado': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getTimeColor = (time: string) => {
  if (time.includes('2-5')) return 'text-green-600';
  if (time.includes('5-10')) return 'text-yellow-600';
  if (time.includes('10-15')) return 'text-red-600';
  return 'text-gray-600';
};
