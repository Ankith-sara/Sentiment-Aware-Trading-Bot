import React from 'react';
import { TrendingUp, Moon, Sun, RefreshCw, MessageCircle, BarChart3, Briefcase, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTrading } from '../contexts/TradingContext';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { isDark, toggleTheme } = useTheme();
  const { refreshData, isLoading, portfolio } = useTrading();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'AI Assistant', icon: MessageCircle },
    { id: 'news', label: 'News & Sentiment', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'history', label: 'Trade History', icon: BarChart3 },
    { id: 'config', label: 'Configuration', icon: Settings },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  SentimentBot Pro
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI Trading Assistant
                </p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-1 ml-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-400">Portfolio Value</p>
                <p className={`font-bold ${portfolio.dailyPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${portfolio.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-400">Daily P&L</p>
                <p className={`font-bold ${portfolio.dailyPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {portfolio.dailyPnL >= 0 ? '+' : ''}${portfolio.dailyPnL.toFixed(2)}
                </p>
              </div>
            </div>
            
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};