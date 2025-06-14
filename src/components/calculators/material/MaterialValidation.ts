
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
      
      // Verificação de campo obrigatório
      if (rule.required && (value === undefined || value === '' || value === null)) {
        errors.push(`${rule.field} é obrigatório`);
        return;
      }

      // Se o valor existe e não está vazio, validar
      if (value !== undefined && value !== '' && value !== null) {
        const numValue = Number(value);
        
        // Verificar se é um número válido quando esperado
        if (typeof value !== 'string' && isNaN(numValue)) {
          errors.push(`${rule.field} deve ser um número válido`);
          return;
        }

        // Validações numéricas apenas se for um número
        if (typeof value === 'number' || !isNaN(numValue)) {
          if (rule.min !== undefined && numValue < rule.min) {
            errors.push(`${rule.field} deve ser maior ou igual a ${rule.min}`);
          }

          if (rule.max !== undefined && numValue > rule.max) {
            errors.push(`${rule.field} deve ser menor ou igual a ${rule.max}`);
          }
        }

        // Validador customizado
        if (rule.customValidator) {
          const customError = rule.customValidator(value);
          if (customError) {
            errors.push(customError);
          }
        }
      }
    });

    // Mostrar erros se houver
    if (errors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: errors.join('; '),
        variant: "destructive",
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  static sanitizeNumericInput(value: string | number, defaultValue = 0): number {
    if (value === '' || value === null || value === undefined) {
      return defaultValue;
    }
    
    const num = Number(value);
    if (isNaN(num)) {
      return defaultValue;
    }
    
    return Math.max(0, num); // Garantir que não seja negativo
  }

  static validatePositiveNumber(value: any, fieldName: string): string | null {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} deve ser um número positivo`;
    }
    return null;
  }

  static validateRange(value: any, min: number, max: number, fieldName: string): string | null {
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} deve ser um número válido`;
    }
    if (num < min || num > max) {
      return `${fieldName} deve estar entre ${min} e ${max}`;
    }
    return null;
  }
}
