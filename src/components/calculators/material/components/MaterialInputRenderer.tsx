
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
              <SelectTrigger>
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
            />
          );
        
        default:
          return (
            <Input
              type="text"
              value={String(values[input.key] || input.defaultValue || '')}
              onChange={(e) => onChange(input.key, e.target.value)}
            />
          );
      }
    };

    return (
      <div key={input.key} className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor={input.key} className="text-sm font-medium">
            {input.label}
            {input.unit && <span className="text-gray-500 ml-1">({input.unit})</span>}
            {input.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {input.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{input.tooltip}</p>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {inputs.map(renderInput)}
    </div>
  );
};
