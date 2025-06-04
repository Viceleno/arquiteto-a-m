
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostResult } from './CostCalculatorTypes';

interface CostResultChartProps {
  result: CostResult;
}

export const CostResultChart: React.FC<CostResultChartProps> = ({ result }) => {
  const chartData = [
    { name: 'Materiais', value: result.materialTotal, color: '#3B82F6' },
    { name: 'Mão de Obra', value: result.laborTotal, color: '#10B981' },
    { name: 'BDI', value: result.bdiAmount, color: '#F59E0B' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.payload.color }}>
            {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-sm text-gray-600">
            {((data.value / result.totalCost) * 100).toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
