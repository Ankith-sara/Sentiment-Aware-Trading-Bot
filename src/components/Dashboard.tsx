<<<<<<< HEAD
import React from 'react';
import { PriceChart } from './PriceChart';
import { SentimentOverview } from './SentimentOverview';
import { RecentSignals } from './RecentSignals';
import { MarketSummary } from './MarketSummary';
import { WatchlistPanel } from './WatchlistPanel';
import { TechnicalIndicators } from './TechnicalIndicators';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <MarketSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="lg:col-span-3 space-y-4 lg:space-y-6">
          <PriceChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <TechnicalIndicators />
            <SentimentOverview />
          </div>
        </div>
        <div className="space-y-4 lg:space-y-6">
          <WatchlistPanel />
        </div>
      </div>
      
      <RecentSignals />
    </div>
  );
};
=======
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, Activity, BarChart3, Target, Zap } from 'lucide-react';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/firebase';

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

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [botStatus, setBotStatus] = useState({
    isActive: true,
    lastAction: 'Analyzing sentiment patterns...',
    signalsProcessed: 1247,
    accuracy: 78.5,
  });

  const watchedSymbols = ['AAPL', 'TSLA', 'MSFT', 'NVDA'];

  // Fetch initial data
  useEffect(() => {
    if (!currentUser) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch market data
        const marketDataResponse = await apiService.getMarketData({ symbols: watchedSymbols });
        
        // Fetch trading signals to get sentiment scores
        const tradingSignals = await apiService.getTradingSignals(watchedSymbols);
        
        // Combine market data with sentiment
        const combinedData = marketDataResponse.map(market => {
          const signal = tradingSignals.find(s => s.symbol === market.symbol);
          return {
            symbol: market.symbol,
            price: market.price,
            change: market.change,
            changePercent: market.change_percent,
            sentiment: signal?.sentiment_score || 0.5,
            volume: market.volume
          };
        });

        setMarketData(combinedData);

        // Fetch trading history from Firebase
        const tradesResponse = await firebaseService.getTrades(currentUser.uid, 3);
        const formattedTrades = tradesResponse.map(trade => ({
          id: trade.id || '',
          symbol: trade.symbol,
          type: trade.action as 'buy' | 'sell',
          quantity: trade.quantity,
          price: trade.price,
          timestamp: trade.createdAt?.toDate() || new Date(),
          sentiment: trade.sentimentScore || 0.5
        }));
        setRecentTrades(formattedTrades);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        // Fallback to mock data
        setMarketData([
          { symbol: 'AAPL', price: 176.88, change: 2.34, changePercent: 1.34, sentiment: 0.76, volume: 45623000 },
          { symbol: 'TSLA', price: 248.32, change: -4.32, changePercent: -1.71, sentiment: 0.42, volume: 67432000 },
          { symbol: 'MSFT', price: 335.22, change: 3.41, changePercent: 1.03, sentiment: 0.68, volume: 23145000 },
          { symbol: 'NVDA', price: 718.45, change: 12.68, changePercent: 1.79, sentiment: 0.84, volume: 34567000 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]);

  // Real-time Firebase listeners
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to real-time trades
    const unsubscribeTrades = firebaseService.subscribeToTrades(currentUser.uid, (trades) => {
      const formattedTrades = trades.slice(0, 3).map(trade => ({
        id: trade.id || '',
        symbol: trade.symbol,
        type: trade.action as 'buy' | 'sell',
        quantity: trade.quantity,
        price: trade.price,
        timestamp: trade.createdAt?.toDate() || new Date(),
        sentiment: trade.sentimentScore || 0.5
      }));
      setRecentTrades(formattedTrades);
    });

    return () => {
      unsubscribeTrades();
    };
  }, [currentUser]);
  // Real-time updates
  useEffect(() => {
    if (loading || !currentUser) return;

    const interval = setInterval(async () => {
      try {
        // Fetch updated market data
        const marketDataResponse = await apiService.getMarketData({ symbols: watchedSymbols });
        const tradingSignals = await apiService.getTradingSignals(watchedSymbols);
        
        const combinedData = marketDataResponse.map(market => {
          const signal = tradingSignals.find(s => s.symbol === market.symbol);
          return {
            symbol: market.symbol,
            price: market.price,
            change: market.change,
            changePercent: market.change_percent,
            sentiment: signal?.sentiment_score || 0.5,
            volume: market.volume
          };
        });

        setMarketData(combinedData);
      } catch (err) {
        console.error('Error updating market data:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [loading, currentUser]);

  // Calculate portfolio metrics
  const totalValue = marketData.reduce((sum, asset) => sum + (asset.price * 100), 0); // Assume 100 shares each
  const todayChange = marketData.reduce((sum, asset) => sum + (asset.change * 100), 0);
  const todayChangePercent = totalValue > 0 ? (todayChange / (totalValue - todayChange)) * 100 : 0;
  const overallSentiment = marketData.reduce((acc, asset) => acc + asset.sentiment, 0) / marketData.length;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 p-6 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className={`ml-4 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-all duration-500 p-6 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className={`text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <p className="text-lg mb-4">{error}</p>
              <p className="text-sm opacity-75">Using fallback data for demonstration</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
>>>>>>> e055dc2ea80f786ab36bf8b1a974db61f91ca2a2
