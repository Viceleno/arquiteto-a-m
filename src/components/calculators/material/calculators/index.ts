
import { flooringCalculator } from './FlooringCalculator';
import { paintingCalculator } from './PaintingCalculator';
import { masonryCalculator } from './MasonryCalculator';
import { roofingCalculator } from './RoofingCalculator';
import { drywallCalculator } from './DrywallCalculator';
import { lightingCalculator } from './LightingCalculator';
import { stairsCalculator } from './StairsCalculator';
import { concreteCalculator } from './ConcreteCalculator';

// Mapa de todas as calculadoras disponíveis
export const materialCalculators = {
  flooring: flooringCalculator,
  painting: paintingCalculator,
  masonry: masonryCalculator,
  roofing: roofingCalculator,
  drywall: drywallCalculator,
  lighting: lightingCalculator,
  stairs: stairsCalculator,
  concrete: concreteCalculator,
};

export type MaterialCalculatorType = keyof typeof materialCalculators;

// Re-export individual calculators if needed
export { 
  flooringCalculator, 
  paintingCalculator,
  masonryCalculator,
  roofingCalculator,
  drywallCalculator,
  lightingCalculator,
  stairsCalculator,
  concreteCalculator
};
