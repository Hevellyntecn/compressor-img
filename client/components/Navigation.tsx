'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Image, 
  FileText, 
  Zap, 
  Settings, 
  Download,
  Sparkles 
} from 'lucide-react';

const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Compressão',
      href: '/',
      icon: Image,
      description: 'Comprimir imagens'
    },
    {
      name: 'Conversor',
      href: '/converter',
      icon: FileText,
      description: 'Converter documentos'
    }
  ];

  return (
    <nav className="bg-gray-800/30 backdrop-blur-soft border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* left spacer */}
          <div className="w-1/3 hidden md:block" />

          {/* Navigation Items - centered on desktop */}
          <div className="hidden md:flex items-center justify-center space-x-1 w-1/3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative px-4 py-2 rounded-lg transition-all duration-300 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-gradient-purple/20 to-gradient-pink/20 text-white shadow-glow' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gradient-pink' : ''}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    {item.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button (right) */}
          <div className="w-1/3 flex justify-end">
            <div className="md:hidden">
            <button className="text-gray-300 hover:text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-700/50 py-4">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-gradient-purple/20 to-gradient-pink/20 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
