
export { flooringCalculator } from './FlooringCalculator';
export { paintingCalculator } from './PaintingCalculator';

// Mapa de todas as calculadoras disponíveis
export const materialCalculators = {
  flooring: flooringCalculator,
  painting: paintingCalculator,
};

export type MaterialCalculatorType = keyof typeof materialCalculators;
