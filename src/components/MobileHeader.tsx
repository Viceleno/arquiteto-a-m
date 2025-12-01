import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Menu,
  LogIn,
  LogOut,
  User,
  Settings,
  Github,
  Home,
  Calculator,
  History,
  Ruler,
  HardHat,
  DollarSign,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Calculator, label: 'Calculadoras', path: '/calculators' },
  { icon: History, label: 'Histórico', path: '/history' },
  { icon: FolderOpen, label: 'Projetos', path: '/projects' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

const calculatorItems = [
  { icon: Ruler, label: 'Área e Volume', path: '/calculators/area' },
  { icon: HardHat, label: 'Materiais', path: '/calculators/materials' },
  { icon: DollarSign, label: 'Custos', path: '/calculators/costs' },
];

export const MobileHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = location.pathname;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="flex h-14 items-center px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 w-9 h-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center space-x-2 px-4 py-4 border-b">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="font-bold text-lg text-gray-900">ArqCalc</span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    Menu Principal
                  </h3>
                  <div className="space-y-1">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors",
                          currentPath === item.path
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    Calculadoras
                  </h3>
                  <div className="space-y-1">
                    {calculatorItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors",
                          currentPath === item.path
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </nav>

              {/* User section */}
              {user && (
                <div className="border-t p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 ml-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-lg text-gray-900">ArqCalc</span>
        </Link>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-2">
          {!user && (
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};