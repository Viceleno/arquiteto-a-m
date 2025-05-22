
import React from 'react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

interface CalculatorCardProps {
  calculator: Calculator;
}

export const CalculatorCard = ({ calculator }: CalculatorCardProps) => {
  const navigate = useNavigate();
  const Icon = calculator.icon;

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-blue-200 cursor-pointer"
      onClick={() => navigate(`/calculators/${calculator.id}`)}
    >
      <div className="p-6">
        <div className={`h-12 w-12 rounded-lg ${calculator.color} flex items-center justify-center mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{calculator.title}</h3>
        <p className="text-gray-600 text-sm">{calculator.description}</p>
      </div>
    </Card>
  );
};
