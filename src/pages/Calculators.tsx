
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
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 w-full">
        <Header />
        <main className="container mx-auto py-4 sm:py-6 px-2 sm:px-4">
          {type ? (
            <div className="w-full">
              {getCalculatorComponent()}
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">
                  Calculadoras para Arquitetura e Construção
                </h1>
                <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
                  Selecione uma calculadora abaixo para começar. Todas as calculadoras possuem
                  a opção de salvar os resultados no seu histórico.
                </p>
              </div>
              
              {/* Display calculators by category from CalculatorGrid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="col-span-full">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                    Calculadoras Disponíveis
                  </h2>
                </div>
                <div 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-primary/20 cursor-pointer bg-card rounded-lg"
                  onClick={() => window.location.href = '/calculators/area'}
                >
                  <div className="p-4 sm:p-6">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-500 flex items-center justify-center mb-3 sm:mb-4">
                      <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Cálculo de Área</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Calcule áreas de diferentes formas geométricas
                    </p>
                  </div>
                </div>
                
                <div 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-primary/20 cursor-pointer bg-card rounded-lg"
                  onClick={() => window.location.href = '/calculators/materials'}
                >
                  <div className="p-4 sm:p-6">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-500 flex items-center justify-center mb-3 sm:mb-4">
                      <HardHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Estimativa de Materiais</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Concreto, tijolos, argamassa e mais
                    </p>
                  </div>
                </div>
                
                <div 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-primary/20 cursor-pointer bg-card rounded-lg"
                  onClick={() => window.location.href = '/calculators/costs'}
                >
                  <div className="p-4 sm:p-6">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-emerald-500 flex items-center justify-center mb-3 sm:mb-4">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Estimativa de Custos</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Orçamento básico de materiais
                    </p>
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
