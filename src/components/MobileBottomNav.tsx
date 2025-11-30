import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calculator, History, User, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Calculator, label: 'Calculadoras', path: '/calculators' },
  { icon: Tag, label: 'Preços', path: '/prices' },
  { icon: History, label: 'Histórico', path: '/history' },
  { icon: User, label: 'Perfil', path: '/settings' },
];

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.path || 
            (item.path === '/calculators' && currentPath.startsWith('/calculators'));
          
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn("w-5 h-5 mb-1", isActive && "text-blue-600")} />
              <span className={cn(
                "text-xs font-medium truncate",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};