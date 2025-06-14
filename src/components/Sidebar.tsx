
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calculator, History, Settings, Home, Ruler, HardHat, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Calculator, label: 'Calculadoras', path: '/calculators' },
  { icon: History, label: 'Histórico', path: '/history' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

const calculatorItems = [
  { icon: Ruler, label: 'Área e Volume', path: '/calculators/area' },
  { icon: HardHat, label: 'Materiais', path: '/calculators/materials' },
  { icon: DollarSign, label: 'Custos', path: '/calculators/costs' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <nav className="p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
            Menu Principal
          </h2>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    currentPath === item.path
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
            Calculadoras
          </h2>
          <ul className="space-y-2">
            {calculatorItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    currentPath === item.path
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
};
