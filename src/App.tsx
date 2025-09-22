<<<<<<< HEAD
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { Dashboard } from './components/Dashboard';
import { NewsPanel } from './components/NewsPanel';
import { ConfigPanel } from './components/ConfigPanel';
import { TradeHistory } from './components/TradeHistory';
import { Portfolio } from './components/Portfolio';
import { ChatAssistant } from './components/ChatAssistant';
import { AlertsPanel } from './components/AlertsPanel';
import { BacktestPanel } from './components/BacktestPanel';
import { ThemeProvider } from './contexts/ThemeContext';
import { TradingProvider } from './contexts/TradingContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)]">
            <div className="lg:col-span-2 min-h-0">
              <ChatAssistant />
            </div>
            <div className="space-y-4 min-h-0 overflow-y-auto">
              <AlertsPanel />
            </div>
          </div>
        );
      case 'news':
        return <NewsPanel />;
      case 'portfolio':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <Portfolio />
            </div>
            <div>
              <BacktestPanel />
            </div>
          </div>
        );
      case 'history':
        return <TradeHistory />;
      case 'config':
        return <ConfigPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <TradingProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* Header - Show on all screens */}
          <div className="w-full">
            <MobileHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          </div>
          
          {/* Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          {/* Main Content */}
          <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0 w-full overflow-x-hidden">
            <div className="w-full px-4 py-4 lg:py-6 max-w-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </TradingProvider>
=======
import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Settings, Bell, BarChart3, Brain, Sun, Moon, LogOut, User, Wallet, Zap } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import Dashboard from './components/Dashboard';
import TradingHistory from './components/TradingHistory';
import SettingsPanel from './components/SettingsPanel';
import NewsPanel from './components/NewsPanel';
import ProfilePage from './components/ProfilePage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(true);
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 127845.32,
    todayPnL: 2341.12,
    todayPnLPercent: 1.87
  });
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  // Simulate WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
      // Simulate portfolio updates
      setPortfolioData(prev => ({
        ...prev,
        totalValue: prev.totalValue + (Math.random() - 0.5) * 100,
        todayPnL: prev.todayPnL + (Math.random() - 0.5) * 50,
        todayPnLPercent: prev.todayPnLPercent + (Math.random() - 0.5) * 0.1
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'history', label: 'Trading History', icon: Activity },
    { id: 'news', label: 'Sentiment Feed', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-xl border-b px-6 py-4 transition-all duration-300 ${
        isDark 
          ? 'bg-gray-900/80 border-gray-800 shadow-2xl' 
          : 'bg-white/80 border-gray-200 shadow-lg'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                SentiBot Pro
              </h1>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isDark ? 'bg-gray-800/50' : 'bg-white/50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <div className={`text-right p-4 rounded-xl border ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white/50 border-gray-200'
              }`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Portfolio Value
                </div>
                <div className="text-lg font-bold text-green-400">
                  ${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`text-right p-4 rounded-xl border ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white/50 border-gray-200'
              }`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Today's P&L
                </div>
                <div className={`text-lg font-bold flex items-center ${
                  portfolioData.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {portfolioData.todayPnL >= 0 ? '+' : ''}${portfolioData.todayPnL.toFixed(2)} ({portfolioData.todayPnLPercent.toFixed(2)}%)
                </div>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-all duration-300 shadow-lg ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800 bg-gray-800/50' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-white/50'
              }`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button className={`relative p-3 rounded-xl transition-all duration-300 shadow-lg ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800 bg-gray-800/50' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-white/50'
            }`}>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">3</span>
            </button>
            
            {/* User Menu */}
            <div className={`flex items-center space-x-3 p-3 rounded-xl border ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white/50 border-gray-200'
            }`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.displayName || currentUser?.email || 'User'}
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                  <div className={`text-xs font-medium ${isDark ? 'text-yellow-400' : 'text-orange-600'}`}>
                    Premium Account
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 backdrop-blur-xl border-r min-h-[calc(100vh-80px)] transition-all duration-300 ${
          isDark 
            ? 'bg-gray-900/80 border-gray-800 shadow-2xl' 
            : 'bg-white/80 border-gray-200 shadow-lg'
        }`}>
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 shadow-lg ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transform scale-105'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:transform hover:scale-105'
                          : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 hover:transform hover:scale-105'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
            
            {/* Quick Stats in Sidebar */}
            <div className="mt-8 space-y-4">
              <div className={`p-4 rounded-xl border ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white/50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="h-4 w-4 text-green-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Active Trades
                  </span>
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  12
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white/50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Bot Status
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'history' && <TradingHistory />}
          {activeTab === 'news' && <NewsPanel />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </AuthProvider>
>>>>>>> e055dc2ea80f786ab36bf8b1a974db61f91ca2a2
    </ThemeProvider>
  );
}

export default App;