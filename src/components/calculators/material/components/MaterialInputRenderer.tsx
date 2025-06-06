
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
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
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {input.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
              value={values[input.key] || input.defaultValue || ''}
              onChange={(e) => onChange(input.key, parseFloat(e.target.value) || 0)}
              min={input.min}
              max={input.max}
              step="0.01"
              placeholder={input.unit ? `Valor em ${input.unit}` : ''}
              className="h-10"
            />
          );
        
        default:
          return (
            <Input
              type="text"
              value={String(values[input.key] || input.defaultValue || '')}
              onChange={(e) => onChange(input.key, e.target.value)}
              className="h-10"
            />
          );
      }
    };

    return (
      <div key={input.key} className="space-y-2 w-full">
        <div className="flex items-center space-x-2">
          <Label htmlFor={input.key} className="text-sm font-medium leading-tight">
            {input.label}
            {input.unit && <span className="text-muted-foreground ml-1">({input.unit})</span>}
            {input.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {input.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{input.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {inputElement()}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {inputs.map(renderInput)}
    </div>
  );
};
