
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área (m²)',
    type: 'number',
    required: true,
    min: 0.1,
    tooltip: 'Área a ser concretada'
  },
  {
    key: 'thickness',
    label: 'Espessura (cm)',
    type: 'number',
    defaultValue: 10,
    min: 5,
    max: 50,
    tooltip: 'Espessura da laje de concreto'
  },
  {
    key: 'concreteType',
    label: 'Tipo de Concreto',
    type: 'select',
    defaultValue: 'fck25',
    required: true,
    options: [
      { value: 'fck20', label: 'FCK 20 MPa' },
      { value: 'fck25', label: 'FCK 25 MPa' },
      { value: 'fck30', label: 'FCK 30 MPa' }
    ],
    tooltip: 'Resistência do concreto'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'thickness', required: true, min: 5 }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const thickness = MaterialValidator.sanitizeNumericInput(inputs.thickness, 10);
  
  const volume = area * (thickness / 100); // m³
  const concreteNeeded = volume * 1.05; // 5% de perda
  
  // Materiais para concreto (traço 1:2:3)
  const cement = Math.ceil(concreteNeeded * 7); // sacos de 50kg
  const sand = Math.ceil(concreteNeeded * 0.7); // m³
  const gravel = Math.ceil(concreteNeeded * 1.1); // m³
  
  // Armadura estimada (kg/m³)
  const steelKg = Math.ceil(volume * 80);

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    thickness: { value: thickness, unit: 'cm', category: 'info' },
    volume: { value: volume.toFixed(2), unit: 'm³', category: 'info' },
    concreteNeeded: { value: concreteNeeded.toFixed(2), unit: 'm³', highlight: true, category: 'primary' },
    cement: { value: cement, unit: 'sacos 50kg', highlight: true, category: 'primary' },
    sand: { value: sand, unit: 'm³', category: 'secondary' },
    gravel: { value: gravel, unit: 'm³', category: 'secondary' },
    steelKg: { value: steelKg, unit: 'kg aço', category: 'secondary' }
  };
};

export const concreteCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Concreto',
  description: 'Cálculo de concreto, cimento e armadura'
};
