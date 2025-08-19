import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, Activity, BarChart3, Target, Zap } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  sentiment: number;
  volume: number;
}

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
  sentiment: number;
}

// This component should receive isDark as a prop from the parent
const Dashboard: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'AAPL', price: 14786.40, change: 203.25, changePercent: 1.39, sentiment: 0.76, volume: 45623000 },
    { symbol: 'TSLA', price: 20869.52, change: -432.15, changePercent: -2.03, sentiment: 0.42, volume: 67432000 },
    { symbol: 'MSFT', price: 28048.13, change: 341.76, changePercent: 1.23, sentiment: 0.68, volume: 23145000 },
    { symbol: 'NVDA', price: 59870.59, change: 1068.21, changePercent: 1.82, sentiment: 0.84, volume: 34567000 },
  ]);

  const [recentTrades, setRecentTrades] = useState<Trade[]>([
    { id: '1', symbol: 'AAPL', type: 'buy', quantity: 100, price: 14683.04, timestamp: new Date(Date.now() - 300000), sentiment: 0.78 },
    { id: '2', symbol: 'NVDA', type: 'sell', quantity: 50, price: 59668.37, timestamp: new Date(Date.now() - 600000), sentiment: 0.82 },
    { id: '3', symbol: 'MSFT', type: 'buy', quantity: 75, price: 27806.83, timestamp: new Date(Date.now() - 1200000), sentiment: 0.65 },
  ]);

  const [botStatus, setBotStatus] = useState({
    isActive: true,
    lastAction: 'Analyzing sentiment patterns...',
    signalsProcessed: 1247,
    accuracy: 78.5,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(asset => ({
        ...asset,
        price: asset.price + (Math.random() - 0.5) * 166,
        change: asset.change + (Math.random() - 0.5) * 41.5,
        sentiment: Math.max(0, Math.min(1, asset.sentiment + (Math.random() - 0.5) * 0.1)),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const totalValue = 10611461.60;
  const todayChange = 194342.96;
  const todayChangePercent = 1.87;
  const overallSentiment = marketData.reduce((acc, asset) => acc + asset.sentiment, 0) / marketData.length;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 p-6 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            isDark 
              ? 'text-blue-400 bg-clip-text'
              : 'text-blue-600 bg-clip-text'
          }`}>
            Sentiment Trading Hub
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            AI-Powered Market Intelligence Dashboard
          </p>
        </div>

        {/* Premium Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portfolio Value Card */}
          <div className={`group relative overflow-hidden rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`absolute inset-0 ${
              isDark 
                ? 'bg-gradient-to-br from-emerald-400/5 to-green-600/5' 
                : 'bg-gradient-to-br from-emerald-400/10 to-green-600/10'
            }`}></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <IndianRupee className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Portfolio Value</p>
                </div>
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{formatINR(totalValue)}</p>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 text-sm font-semibold">
                  +{formatINR(todayChange)} ({todayChangePercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Bot Status Card */}
          <div className={`group relative overflow-hidden rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`absolute inset-0 ${
              isDark 
                ? 'bg-gradient-to-br from-blue-400/5 to-indigo-600/5' 
                : 'bg-gradient-to-br from-blue-400/10 to-indigo-600/10'
            }`}></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Active</p>
                </div>
              </div>
              <p className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>AI Trading Bot</p>
              <p className={`text-sm line-clamp-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>{botStatus.lastAction}</p>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className={`group relative overflow-hidden rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`absolute inset-0 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-400/5 to-violet-600/5' 
                : 'bg-gradient-to-br from-purple-400/10 to-violet-600/10'
            }`}></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Accuracy Rate</p>
                </div>
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{botStatus.accuracy}%</p>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>{botStatus.signalsProcessed.toLocaleString()} signals processed</p>
            </div>
          </div>

          {/* Market Sentiment Card */}
          <div className={`group relative overflow-hidden rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`absolute inset-0 ${
              isDark 
                ? 'bg-gradient-to-br from-amber-400/5 to-orange-600/5' 
                : 'bg-gradient-to-br from-amber-400/10 to-orange-600/10'
            }`}></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl shadow-lg ${
                  overallSentiment > 0.6 
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                    : overallSentiment > 0.4 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                    : 'bg-gradient-to-br from-red-500 to-rose-600'
                }`}>
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Market Sentiment</p>
                </div>
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{(overallSentiment * 100).toFixed(1)}%</p>
              <div className="flex items-center space-x-2">
                <Zap className={`h-4 w-4 ${overallSentiment > 0.6 ? 'text-emerald-500' : overallSentiment > 0.4 ? 'text-amber-500' : 'text-red-500'}`} />
                <span className={`text-sm font-semibold ${overallSentiment > 0.6 ? 'text-emerald-600' : overallSentiment > 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                  {overallSentiment > 0.6 ? 'Bullish Market' : overallSentiment > 0.4 ? 'Neutral Zone' : 'Bearish Trend'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Chart */}
          <div className={`lg:col-span-2 rounded-2xl shadow-xl border p-8 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Price Movement</h3>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-800' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50'
              }`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>Live Data</span>
              </div>
            </div>
            <div className={`h-80 rounded-xl flex items-center justify-center border-2 border-dashed transition-colors duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600' 
                : 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200'
            }`}>
              <div className="text-center">
                <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <p className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>Interactive Price Chart</p>
                <p className={`text-sm ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>Real-time market data visualization</p>
              </div>
            </div>
          </div>

          {/* Sentiment Gauge */}
          <div className={`rounded-2xl shadow-xl border p-8 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Sentiment Analysis</h3>
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDark ? "#374151" : "#f1f5f9"}
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={overallSentiment > 0.6 ? "#10b981" : overallSentiment > 0.4 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="2"
                    strokeDasharray={`${overallSentiment * 100}, 100`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{(overallSentiment * 100).toFixed(0)}%</p>
                    <p className={`text-xs font-semibold ${overallSentiment > 0.6 ? 'text-emerald-600' : overallSentiment > 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                      {overallSentiment > 0.6 ? 'BULLISH' : overallSentiment > 0.4 ? 'NEUTRAL' : 'BEARISH'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assets and Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Watched Assets */}
          <div className={`rounded-2xl shadow-xl border p-8 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Portfolio Assets</h3>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                {marketData.length} Assets
              </div>
            </div>
            <div className="space-y-4">
              {marketData.map((asset, index) => (
                <div key={asset.symbol} className={`group relative overflow-hidden rounded-xl p-6 border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600 hover:from-gray-600 hover:to-gray-500' 
                    : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-gray-700 to-black' :
                        index === 1 ? 'bg-gradient-to-br from-red-500 to-red-700' :
                        index === 2 ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                        'bg-gradient-to-br from-green-500 to-emerald-700'
                      }`}>
                        {asset.symbol}
                      </div>
                      <div>
                        <p className={`font-bold text-lg ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{formatINR(asset.price)}</p>
                        <div className="flex items-center space-x-2">
                          {asset.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-semibold ${asset.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {asset.change >= 0 ? '+' : ''}{formatINR(asset.change)} ({asset.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        asset.sentiment > 0.6 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : asset.sentiment > 0.4 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Sentiment: {(asset.sentiment * 100).toFixed(0)}%
                      </div>
                      <p className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Vol: {(asset.volume / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades */}
          <div className={`rounded-2xl shadow-xl border p-8 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Recent Trades</h3>
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                {recentTrades.length} Trades Today
              </div>
            </div>
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div key={trade.id} className={`group relative overflow-hidden rounded-xl p-6 border hover:shadow-lg transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-gray-700 to-purple-900/30 border-gray-600' 
                    : 'bg-gradient-to-r from-gray-50 to-purple-50 border-gray-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full shadow-lg ${trade.type === 'buy' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-lg ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{trade.symbol}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase ${
                            trade.type === 'buy' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.type}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {trade.quantity} shares @ {formatINR(trade.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatINR(trade.quantity * trade.price)}
                      </p>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          trade.sentiment > 0.6 ? 'bg-emerald-400' : 
                          trade.sentiment > 0.4 ? 'bg-amber-400' : 'bg-red-400'
                        }`}></div>
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Sentiment: {(trade.sentiment * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={`rounded-2xl shadow-xl border p-8 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`text-center p-6 rounded-xl border ${
              isDark 
                ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-800/50' 
                : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>+{todayChangePercent}%</p>
              <p className={`text-sm font-semibold uppercase tracking-wider ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>Today's Gain</p>
            </div>
            
            <div className={`text-center p-6 rounded-xl border ${
              isDark 
                ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-800/50' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{botStatus.signalsProcessed}</p>
              <p className={`text-sm font-semibold uppercase tracking-wider ${
                isDark ? 'text-blue-400' : 'text-blue-700'
              }`}>Signals Analyzed</p>
            </div>
            
            <div className={`text-center p-6 rounded-xl border ${
              isDark 
                ? 'bg-gradient-to-br from-purple-900/30 to-violet-900/30 border-purple-800/50' 
                : 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{botStatus.accuracy}%</p>
              <p className={`text-sm font-semibold uppercase tracking-wider ${
                isDark ? 'text-purple-400' : 'text-purple-700'
              }`}>Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;