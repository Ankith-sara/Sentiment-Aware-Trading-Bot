import React from 'react';
import { Menu, RefreshCw, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTrading } from '../contexts/TradingContext';

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  const { isDark, toggleTheme } = useTheme();
  const { refreshData, isLoading, portfolio } = useTrading();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              SentimentBot Pro
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right text-sm">
            <p className="text-gray-600 dark:text-gray-400">Portfolio</p>
            <p className={`font-bold ${portfolio.dailyPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ₹{portfolio.totalValue.toLocaleString('en-IN')}
            </p>
          </div>
          
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};