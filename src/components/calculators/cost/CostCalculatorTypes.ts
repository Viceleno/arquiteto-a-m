
export interface MaterialComposition {
  name: string;
  unit: string;
  consumption: number; // quantidade por m² ou m³
  unitPrice: number; // preço por unidade
  category: 'material' | 'auxiliary' | 'labor';
}

export interface MaterialData {
  name: string;
  baseUnit: string;
  compositions: MaterialComposition[];
  laborProductivity: number; // m²/dia ou m³/dia
  laborHourRate: number; // R$/hora
  hoursPerDay: number; // horas trabalhadas por dia
  wastePercentage: number; // percentual de perda
}

export interface CostResult {
  material: string;
  area: number;
  complexity: string;
  materialDetails: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    category: string;
  }>;
  materialTotal: number;
  laborTotal: number;
  subtotal: number;
  bdi: number;
  bdiAmount: number;
  totalCost: number;
  costPerM2: number;
}

export const complexityFactors = {
  simple: { name: 'Simples', factor: 1, description: 'Geometria regular, poucos recortes' },
  medium: { name: 'Média', factor: 1.3, description: 'Geometria com algumas irregularidades' },
  complex: { name: 'Complexa', factor: 1.8, description: 'Geometria irregular, muitos recortes' },
};

export const materialsDatabase: Record<string, MaterialData> = {
  concrete: {
    name: 'Concreto Armado',
    baseUnit: 'm³',
    laborProductivity: 8, // m³/dia
    laborHourRate: 35,
    hoursPerDay: 8,
    wastePercentage: 5,
    compositions: [
      { name: 'Cimento CP-32', unit: 'saco 50kg', consumption: 7, unitPrice: 28, category: 'material' },
      { name: 'Areia média', unit: 'm³', consumption: 0.64, unitPrice: 85, category: 'material' },
      { name: 'Brita 1', unit: 'm³', consumption: 0.64, unitPrice: 95, category: 'material' },
      { name: 'Aço CA-50', unit: 'kg', consumption: 120, unitPrice: 8.5, category: 'material' },
      { name: 'Madeira para forma', unit: 'm²', consumption: 4, unitPrice: 25, category: 'auxiliary' },
      { name: 'Arame recozido', unit: 'kg', consumption: 2, unitPrice: 12, category: 'auxiliary' },
    ]
  },
  brick: {
    name: 'Alvenaria de Tijolos',
    baseUnit: 'm²',
    laborProductivity: 15, // m²/dia
    laborHourRate: 32,
    hoursPerDay: 8,
    wastePercentage: 8,
    compositions: [
      { name: 'Tijolo cerâmico 6 furos', unit: 'unidade', consumption: 55, unitPrice: 1.2, category: 'material' },
      { name: 'Argamassa de assentamento', unit: 'm³', consumption: 0.018, unitPrice: 280, category: 'material' },
      { name: 'Argamassa de revestimento', unit: 'm³', consumption: 0.025, unitPrice: 320, category: 'auxiliary' },
    ]
  },
  paint: {
    name: 'Pintura',
    baseUnit: 'm²',
    laborProductivity: 45, // m²/dia
    laborHourRate: 28,
    hoursPerDay: 8,
    wastePercentage: 15,
    compositions: [
      { name: 'Tinta acrílica', unit: 'litro', consumption: 0.25, unitPrice: 45, category: 'material' },
      { name: 'Selador acrílico', unit: 'litro', consumption: 0.15, unitPrice: 35, category: 'auxiliary' },
      { name: 'Massa corrida PVA', unit: 'kg', consumption: 1.2, unitPrice: 8, category: 'auxiliary' },
      { name: 'Lixa para parede', unit: 'folha', consumption: 0.5, unitPrice: 3.5, category: 'auxiliary' },
    ]
  },
  ceramic: {
    name: 'Revestimento Cerâmico',
    baseUnit: 'm²',
    laborProductivity: 12, // m²/dia
    laborHourRate: 40,
    hoursPerDay: 8,
    wastePercentage: 10,
    compositions: [
      { name: 'Cerâmica 45x45cm', unit: 'm²', consumption: 1.1, unitPrice: 35, category: 'material' },
      { name: 'Argamassa colante AC-I', unit: 'kg', consumption: 4.5, unitPrice: 1.8, category: 'auxiliary' },
      { name: 'Rejunte', unit: 'kg', consumption: 0.8, unitPrice: 25, category: 'auxiliary' },
      { name: 'Espaçador plástico', unit: 'pç', consumption: 15, unitPrice: 0.15, category: 'auxiliary' },
    ]
  },
  wood: {
    name: 'Piso de Madeira',
    baseUnit: 'm²',
    laborProductivity: 20, // m²/dia
    laborHourRate: 45,
    hoursPerDay: 8,
    wastePercentage: 12,
    compositions: [
      { name: 'Piso laminado', unit: 'm²', consumption: 1.1, unitPrice: 85, category: 'material' },
      { name: 'Manta acústica', unit: 'm²', consumption: 1.05, unitPrice: 12, category: 'auxiliary' },
      { name: 'Rodapé', unit: 'm', consumption: 0.4, unitPrice: 15, category: 'auxiliary' },
      { name: 'Cola para piso', unit: 'kg', consumption: 1.2, unitPrice: 18, category: 'auxiliary' },
    ]
  },
};
