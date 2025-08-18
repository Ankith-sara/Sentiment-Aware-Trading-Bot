import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Settings, Bell, DollarSign, BarChart3, Brain, Sun, Moon, LogOut } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import Dashboard from './components/Dashboard';
import TradingHistory from './components/TradingHistory';
import SettingsPanel from './components/SettingsPanel';
import NewsPanel from './components/NewsPanel';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  // Simulate WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'history', label: 'Trading History', icon: Activity },
    { id: 'news', label: 'Sentiment Feed', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-950 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b px-6 py-4 transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-500" />
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                SentiBot Pro
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Portfolio Value
                </div>
                <div className="text-lg font-semibold text-green-400">$127,845.32</div>
              </div>
              <div className="text-right">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Today's P&L
                </div>
                <div className="text-lg font-semibold text-green-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +$2,341.12 (1.87%)
                </div>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button className={`relative p-2 transition-colors duration-300 ${
              isDark 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-500 hover:text-gray-900'
            }`}>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.displayName || currentUser?.email || 'User'}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Premium Account
                </div>
              </div>
              <button
                onClick={logout}
                className={`p-2 rounded-lg transition-colors duration-300 ${
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
        <aside className={`w-64 border-r min-h-[calc(100vh-80px)] transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeTab === id
                        ? 'bg-blue-600 text-white'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'history' && <TradingHistory />}
          {activeTab === 'news' && <NewsPanel />}
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
    </ThemeProvider>
  );
}

export default App;