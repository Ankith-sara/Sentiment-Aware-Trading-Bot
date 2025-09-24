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
          <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0 overflow-x-hidden flex-1">
            <div className="w-full px-4 py-4 lg:py-6 max-w-screen-2xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </TradingProvider>
    </ThemeProvider>
  );
}

export default App;