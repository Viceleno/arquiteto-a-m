
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, History, FileText, User, ChevronRight } from 'lucide-react';
import { CalculatorGrid } from '@/components/CalculatorGrid';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
            
            {!user && (
              <Card className="mb-8 bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Crie uma conta para salvar seus cálculos</CardTitle>
                  <CardDescription className="text-blue-700">
                    Mantenha um histórico dos seus cálculos e acesse-os facilmente a qualquer momento
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Criar conta ou entrar
                  </Button>
                </CardFooter>
              </Card>
            )}

            {user && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Histórico</CardTitle>
                    <CardDescription>Acesse seus cálculos anteriores</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => navigate('/history')}
                    >
                      Ver histórico
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Configurações</CardTitle>
                    <CardDescription>Personalize sua experiência</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => navigate('/settings')}
                    >
                      Ver configurações
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            
            <CalculatorGrid />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
