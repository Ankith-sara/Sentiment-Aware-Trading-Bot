import React from 'react';
import { 
  BarChart3, 
  MessageCircle, 
  TrendingUp, 
  Briefcase, 
  History, 
  Settings,
  X,
  Bot,
  Activity,
  IndianRupee
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTrading } from '../contexts/TradingContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onToggle }) => {
  const { isDark } = useTheme();
  const { portfolio } = useTrading();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Market Overview' },
    { id: 'chat', label: 'AI Assistant', icon: MessageCircle, description: 'Trading Advisor' },
    { id: 'news', label: 'News & Sentiment', icon: TrendingUp, description: 'Market Analysis' },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase, description: 'Holdings & Performance' },
    { id: 'history', label: 'Trade History', icon: History, description: 'Past Trades' },
    { id: 'config', label: 'Configuration', icon: Settings, description: 'API & Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 lg:w-72 flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                SentimentBot Pro
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI Trading Assistant
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portfolio Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</span>
              <IndianRupee className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{portfolio.totalValue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily P&L</span>
              <span className={`text-sm font-semibold ${
                portfolio.dailyPnL >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {portfolio.dailyPnL >= 0 ? '+' : ''}₹{portfolio.dailyPnL.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  portfolio.dailyPnL >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.abs(portfolio.dailyPnL / 1000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Status Indicator */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Live Data Active
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Real-time market feeds
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};