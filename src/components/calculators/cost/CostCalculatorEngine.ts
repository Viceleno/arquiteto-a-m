
import { MaterialData, CostResult, complexityFactors, materialsDatabase } from './CostCalculatorTypes';

export class CostCalculatorEngine {
  /**
   * Calcula custos detalhados de uma obra.
   * 
   * @param materialKey - Chave do material (ex: 'concrete', 'brick')
   * @param inputs - Valores de entrada do formulário
   * @param complexity - Nível de complexidade da obra
   * @param bdiPercentage - Percentual de BDI (default: 20%)
   * @param customPrices - Objeto OBRIGATÓRIO com preços customizados no formato { "materialKey_index": price }
   * @returns Resultado detalhado do cálculo de custos
   */
  static calculateCosts(
    materialKey: string,
    inputs: Record<string, number | string>,
    complexity: keyof typeof complexityFactors,
    bdiPercentage: number,
    customPrices: Record<string, number>
  ): CostResult {
    const materialData = materialsDatabase[materialKey];
    if (!materialData) {
      throw new Error('Material não encontrado');
    }

    if (!customPrices || typeof customPrices !== 'object') {
      throw new Error('Objeto de preços customizados é obrigatório');
    }

    const complexityFactor = complexityFactors[complexity].factor;
    
    // Calcular quantidade baseada nos campos específicos do material
    let quantity: number;
    const area = Number(inputs.area || 0);
    
    if (materialData.calculateQuantity) {
      // Usa função customizada de cálculo
      quantity = materialData.calculateQuantity(inputs);
    } else {
      // Usa área diretamente
      quantity = area;
    }

    // Aplicar fator de perda
    const quantityWithWaste = quantity * (1 + materialData.wastePercentage / 100);

    // Calcular materiais e insumos usando preços do contexto
    const materialDetails = materialData.compositions.map((item, index) => {
      const itemQuantity = quantityWithWaste * item.consumption;
      const customPriceKey = `${materialKey}_${index}`;
      // Usar preço do contexto, fallback para preço default do item
      const unitPrice = customPrices[customPriceKey] ?? item.unitPrice;
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
      costPerM2: area > 0 ? Number((totalCost / area).toFixed(2)) : 0,
    };
  }

  static validateInputs(
    materialKey: string,
    inputs: Record<string, number | string>,
    bdi: number
  ): string[] {
    const errors: string[] = [];
    const materialData = materialsDatabase[materialKey];
    
    if (!materialData) {
      errors.push('Selecione um material');
      return errors;
    }
    
    // Validar campos específicos do material
    materialData.inputFields.forEach(field => {
      const value = inputs[field.key];
      
      if (field.required && (!value || value === '')) {
        errors.push(`${field.label} é obrigatório`);
        return;
      }
      
      if (field.type === 'number' && value) {
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          errors.push(`${field.label} deve ser um número`);
          return;
        }
        
        if (field.min !== undefined && numValue < field.min) {
          errors.push(`${field.label} deve ser no mínimo ${field.min}`);
        }
        
        if (field.max !== undefined && numValue > field.max) {
          errors.push(`${field.label} deve ser no máximo ${field.max}`);
        }
      }
    });
    
    // Validar área
    const area = Number(inputs.area || 0);
    if (area > 10000) {
      errors.push('Área muito grande (máximo 10.000 m²)');
    }
    
    if (bdi < 0 || bdi > 100) {
      errors.push('BDI deve estar entre 0% e 100%');
    }
    
    return errors;
  }
}
