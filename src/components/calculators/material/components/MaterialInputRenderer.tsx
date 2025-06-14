
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Calculator } from 'lucide-react';
import { MaterialInput } from '../MaterialCalculatorTypes';

interface MaterialInputRendererProps {
  inputs: MaterialInput[];
  values: Record<string, number | string>;
  onChange: (key: string, value: number | string) => void;
}

export const MaterialInputRenderer: React.FC<MaterialInputRendererProps> = ({
  inputs,
  values,
  onChange
}) => {
  const renderInput = (input: MaterialInput) => {
    const inputElement = () => {
      switch (input.type) {
        case 'select':
          return (
            <Select 
              value={String(values[input.key] || input.defaultValue || '')} 
              onValueChange={(value) => onChange(input.key, value)}
            >
              <SelectTrigger className="h-11 bg-background border-input hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {input.options?.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        
        case 'number':
          return (
            <Input
              type="number"
              value={values[input.key] ?? input.defaultValue ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                onChange(input.key, value === '' ? '' : parseFloat(value) || 0);
              }}
              min={input.min}
              max={input.max}
              step="0.01"
              placeholder={input.unit ? `Digite o valor em ${input.unit}` : 'Digite o valor'}
              className="h-11 bg-background border-input hover:border-primary/50 focus:border-primary transition-colors"
            />
          );
        
        default:
          return (
            <Input
              type="text"
              value={String(values[input.key] || input.defaultValue || '')}
              onChange={(e) => onChange(input.key, e.target.value)}
              className="h-11 bg-background border-input hover:border-primary/50 focus:border-primary transition-colors"
              placeholder="Digite o valor"
            />
          );
      }
    };

    return (
      <Card key={input.key} className="p-4 bg-card border-border hover:shadow-md transition-shadow">
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor={input.key} className="text-sm font-semibold text-foreground leading-tight">
                {input.label}
                {input.unit && <span className="text-muted-foreground ml-1 font-normal">({input.unit})</span>}
                {input.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {input.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs bg-popover border border-border">
                      <div className="p-2">
                        <p className="text-xs text-popover-foreground">{input.tooltip}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Calculator className="w-4 h-4 text-muted-foreground" />
          </div>
          {inputElement()}
          {input.min !== undefined && input.max !== undefined && (
            <p className="text-xs text-muted-foreground">
              Valor entre {input.min} e {input.max} {input.unit || ''}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {inputs.map(renderInput)}
    </div>
  );
};
