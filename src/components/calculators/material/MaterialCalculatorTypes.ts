
export interface MaterialInput {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select';
  defaultValue?: string | number;
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  tooltip?: string;
}

export interface MaterialResult {
  [key: string]: {
    value: string | number;
    unit?: string;
    highlight?: boolean;
    category?: 'primary' | 'secondary' | 'info';
  };
}

export interface CalculationConfig {
  inputs: MaterialInput[];
  calculate: (inputs: Record<string, number | string>) => MaterialResult;
  name: string;
  description: string;
}

// Constantes para cálculos
export const MATERIAL_CONSTANTS = {
  FLOORING: {
    MORTAR_KG_PER_M2: 4,
    GROUT_KG_PER_M2: 0.7,
    DEFAULT_WASTE_FACTOR: 10,
  },
  PAINTING: {
    DEFAULT_COVERAGE: 12, // m²/L
    SEALER_COVERAGE: 10, // m²/L
  },
  MASONRY: {
    BRICK_TYPES: {
      ceramic: { width: 9, height: 19, length: 19, bricksPerM2: 48 },
      ceramic6holes: { width: 11, height: 14, length: 24, bricksPerM2: 25 },
      concrete: { width: 14, height: 19, length: 39, bricksPerM2: 12.5 },
    },
    MORTAR_THICKNESS: 0.02, // m
  },
  ROOFING: {
    TILE_TYPES: {
      ceramic: { tilesPerM2: 16, overlap: 0.05 },
      concrete: { tilesPerM2: 10.5, overlap: 0.04 },
      fiber: { tilesPerM2: 5.1, overlap: 0.10 },
      metal: { tilesPerM2: 4, overlap: 0.15 },
    },
    WASTE_FACTOR: 0.05,
  },
  DRYWALL: {
    PLATE_SIZE: { width: 1.2, height: 2.4 }, // m
    SCREWS_PER_PLATE: 25,
  },
  LIGHTING: {
    RATIOS: {
      excellent: 0.16,
      good: 0.12,
      regular: 0.08,
    },
  },
  VENTILATION: {
    RATIOS: {
      excellent: 0.08,
      good: 0.05,
      regular: 0.03,
    },
  },
  STAIRS: {
    OPTIMAL_RISER: 17, // cm
    BLONDEL_CONSTANT: 65, // cm
    COMFORT_RANGE: { minRiser: 16, maxRiser: 18, minTread: 28, maxTread: 32 },
  },
  RAMPS: {
    MAX_INCLINATION: 8.33, // %
    PLATFORM_INTERVAL: 30, // m
  },
};
