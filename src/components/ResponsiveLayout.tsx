import React from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useMobile } from '@/hooks/useMobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-16">
        <MobileHeader />
        <main className="px-4 py-4">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};