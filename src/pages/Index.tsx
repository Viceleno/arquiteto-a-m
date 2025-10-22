import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, History, User, TrendingUp, Clock, BookOpen, Zap } from 'lucide-react';
import { EnhancedCalculatorGrid } from '@/components/EnhancedCalculatorGrid';
import { SmartWelcomeCard } from '@/components/SmartWelcomeCard';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { HistoryPanel } from '@/components/HistoryPanel';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show skeleton while auth is loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  const quickStats = [
    { 
      icon: Calculator, 
      label: 'Calculadoras', 
      value: '8+', 
      description: 'Ferramentas disponíveis',
      color: 'bg-blue-500'
    },
    { 
      icon: TrendingUp, 
      label: 'Precisão', 
      value: '99.9%', 
      description: 'Baseado em normas técnicas',
      color: 'bg-green-500'
    },
    { 
      icon: Zap, 
      label: 'Velocidade', 
      value: '<1s', 
      description: 'Cálculos instantâneos',
      color: 'bg-orange-500'
    }
  ];

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Smart Welcome Card */}
        <SmartWelcomeCard />
        
        {/* Calculator Grid - Main Focus */}
        <div>
          <EnhancedCalculatorGrid />
        </div>

        {/* History Panel for Mobile */}
        <div className="lg:hidden">
          <HistoryPanel />
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Index;
