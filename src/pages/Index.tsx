
import React from 'react';
import { Calculator, History, FileText, User } from 'lucide-react';
import { CalculatorGrid } from '@/components/CalculatorGrid';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Calculadora de Arquitetura
              </h1>
              <p className="text-gray-600">
                Ferramentas profissionais para cálculos arquitetônicos, estimativas de materiais e conversões
              </p>
            </div>
            
            <CalculatorGrid />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
