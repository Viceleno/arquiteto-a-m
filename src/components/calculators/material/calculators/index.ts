
import { flooringCalculator } from './FlooringCalculator';
import { paintingCalculator } from './PaintingCalculator';

// Mapa de todas as calculadoras disponíveis
export const materialCalculators = {
  flooring: flooringCalculator,
  painting: paintingCalculator,
};

export type MaterialCalculatorType = keyof typeof materialCalculators;

// Re-export individual calculators if needed
export { flooringCalculator, paintingCalculator };
