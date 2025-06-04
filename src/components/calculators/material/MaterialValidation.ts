
import { toast } from '@/hooks/use-toast';

export interface ValidationRule {
  field: string;
  min?: number;
  max?: number;
  required?: boolean;
  customValidator?: (value: any) => string | null;
}

export class MaterialValidator {
  static validateInputs(
    inputs: Record<string, number | string>,
    rules: ValidationRule[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    rules.forEach(rule => {
      const value = inputs[rule.field];
      
      if (rule.required && (!value || value === '')) {
        errors.push(`${rule.field} é obrigatório`);
        return;
      }

      if (value !== undefined && value !== '') {
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          errors.push(`${rule.field} deve ser um número válido`);
          return;
        }

        if (rule.min !== undefined && numValue < rule.min) {
          errors.push(`${rule.field} deve ser maior que ${rule.min}`);
        }

        if (rule.max !== undefined && numValue > rule.max) {
          errors.push(`${rule.field} deve ser menor que ${rule.max}`);
        }

        if (rule.customValidator) {
          const customError = rule.customValidator(value);
          if (customError) {
            errors.push(customError);
          }
        }
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: errors.join(', '),
        variant: "destructive",
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  static sanitizeNumericInput(value: string | number, min = 0): number {
    const num = Number(value) || 0;
    return Math.max(min, num);
  }
}
