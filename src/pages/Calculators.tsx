
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AreaCalculator } from '@/components/calculators/AreaCalculator';
import { MaterialCalculator } from '@/components/calculators/MaterialCalculator';
import { CostCalculator } from '@/components/calculators/CostCalculator';
import { Calculator, HardHat, DollarSign } from 'lucide-react';

const Calculators = () => {
  const { type } = useParams();

  const getCalculatorComponent = () => {
    switch (type) {
      case 'area':
        return <AreaCalculator />;
      case 'materials':
        return <MaterialCalculator />;
      case 'costs':
        return <CostCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="container mx-auto py-6 px-4">
          {type ? (
            <div className="max-w-4xl mx-auto">
              {getCalculatorComponent()}
            </div>
          ) : (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold mb-8">Calculadoras para Arquitetura e Construção</h1>
              <p className="text-gray-600 mb-8">
                Selecione uma calculadora abaixo para começar. Todas as calculadoras possuem
                a opção de salvar os resultados no seu histórico.
              </p>
              
              {/* Display calculators by category from CalculatorGrid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-3">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Calculadoras Disponíveis</h2>
                </div>
                <div 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-blue-200 cursor-pointer bg-white rounded-lg"
                  onClick={() => window.location.href = '/calculators/area'}
                >
                  <div className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center mb-4">
                      <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Cálculo de Área</h3>
                    <p className="text-gray-600 text-sm">Calcule áreas de diferentes formas geométricas</p>
                  </div>
                </div>
                
                <div 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-blue-200 cursor-pointer bg-white rounded-lg"
                  onClick={() => window.location.href = '/calculators/materials'}
                >
                  <div className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                      <HardHat className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Estimativa de Materiais</h3>
                    <p className="text-gray-600 text-sm">Concreto, tijolos, argamassa e mais</p>
                  </div>
                </div>
                
                <div 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-blue-200 cursor-pointer bg-white rounded-lg"
                  onClick={() => window.location.href = '/calculators/costs'}
                >
                  <div className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500 flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Estimativa de Custos</h3>
                    <p className="text-gray-600 text-sm">Orçamento básico de materiais</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Calculators;
