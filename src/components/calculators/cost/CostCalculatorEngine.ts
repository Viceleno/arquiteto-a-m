
import { MaterialData, CostResult, complexityFactors, materialsDatabase } from './CostCalculatorTypes';

export class CostCalculatorEngine {
  static calculateCosts(
    materialKey: string,
    area: number,
    complexity: keyof typeof complexityFactors,
    bdiPercentage: number = 20,
    customPrices: Record<string, number> = {}
  ): CostResult {
    const materialData = materialsDatabase[materialKey];
    if (!materialData) {
      throw new Error('Material não encontrado');
    }

    const complexityFactor = complexityFactors[complexity].factor;
    
    // Calcular volume se necessário (para concreto, por exemplo)
    let quantity = area;
    if (materialData.baseUnit === 'm³' && materialKey === 'concrete') {
      quantity = area * 0.15; // 15cm de espessura padrão
    }

    // Aplicar fator de perda
    const quantityWithWaste = quantity * (1 + materialData.wastePercentage / 100);

    // Calcular materiais e insumos
    const materialDetails = materialData.compositions.map((item, index) => {
      const itemQuantity = quantityWithWaste * item.consumption;
      const customPriceKey = `${materialKey}_${index}`;
      const unitPrice = customPrices[customPriceKey] || item.unitPrice;
      const total = itemQuantity * unitPrice;
      
      return {
        name: item.name,
        quantity: Number(itemQuantity.toFixed(3)),
        unit: item.unit,
        unitPrice: unitPrice,
        total: Number(total.toFixed(2)),
        category: item.category,
      };
    });

    // Calcular custo total de materiais
    const materialTotal = materialDetails
      .filter(item => item.category === 'material' || item.category === 'auxiliary')
      .reduce((sum, item) => sum + item.total, 0);

    // Calcular mão de obra baseada em produtividade
    const daysRequired = quantityWithWaste / materialData.laborProductivity;
    const laborHours = daysRequired * materialData.hoursPerDay;
    const laborTotal = laborHours * materialData.laborHourRate * complexityFactor;

    // Calcular subtotal e BDI
    const subtotal = materialTotal + laborTotal;
    const bdiAmount = subtotal * (bdiPercentage / 100);
    const totalCost = subtotal + bdiAmount;

    return {
      material: materialData.name,
      area,
      complexity: complexityFactors[complexity].name,
      materialDetails,
      materialTotal: Number(materialTotal.toFixed(2)),
      laborTotal: Number(laborTotal.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      bdi: bdiPercentage,
      bdiAmount: Number(bdiAmount.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      costPerM2: Number((totalCost / area).toFixed(2)),
    };
  }

  static validateInputs(area: number, bdi: number): string[] {
    const errors: string[] = [];
    
    if (!area || area <= 0) {
      errors.push('Área deve ser maior que zero');
    }
    
    if (area > 10000) {
      errors.push('Área muito grande (máximo 10.000 m²)');
    }
    
    if (bdi < 0 || bdi > 100) {
      errors.push('BDI deve estar entre 0% e 100%');
    }
    
    return errors;
  }
}
