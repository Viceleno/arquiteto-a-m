
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculatorCardProps {
  calculator: {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    category: string;
  };
}

export const CalculatorCard: React.FC<CalculatorCardProps> = ({ calculator }) => {
  const { title, description, icon: Icon, color } = calculator;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 mb-2">
          <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Clique para usar</span>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
};
