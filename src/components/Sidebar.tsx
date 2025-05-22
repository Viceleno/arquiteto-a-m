
import React from 'react';
import { Calculator, History, FileText, Settings, Home, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: Calculator, label: 'Calculadoras', active: false },
  { icon: History, label: 'Histórico', active: false },
  { icon: FileText, label: 'Documentos', active: false },
  { icon: Ruler, label: 'Conversões', active: false },
  { icon: Settings, label: 'Configurações', active: false },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                  item.active
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
      </nav>
    </aside>
  );
};
