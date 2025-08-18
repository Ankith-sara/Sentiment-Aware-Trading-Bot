import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import PriceChart from './PriceChart';
import SentimentGauge from './SentimentGauge';
import AssetCard from './AssetCard';

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
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'AAPL', price: 178.32, change: 2.45, changePercent: 1.39, sentiment: 0.76, volume: 45623000 },
    { symbol: 'TSLA', price: 251.44, change: -5.21, changePercent: -2.03, sentiment: 0.42, volume: 67432000 },
    { symbol: 'MSFT', price: 338.11, change: 4.12, changePercent: 1.23, sentiment: 0.68, volume: 23145000 },
    { symbol: 'NVDA', price: 721.33, change: 12.87, changePercent: 1.82, sentiment: 0.84, volume: 34567000 },
  ]);

  const [recentTrades, setRecentTrades] = useState<Trade[]>([
    { id: '1', symbol: 'AAPL', type: 'buy', quantity: 100, price: 176.88, timestamp: new Date(Date.now() - 300000), sentiment: 0.78 },
    { id: '2', symbol: 'NVDA', type: 'sell', quantity: 50, price: 718.45, timestamp: new Date(Date.now() - 600000), sentiment: 0.82 },
    { id: '3', symbol: 'MSFT', type: 'buy', quantity: 75, price: 335.22, timestamp: new Date(Date.now() - 1200000), sentiment: 0.65 },
  ]);

  const [botStatus, setBotStatus] = useState({
    isActive: true,
    lastAction: 'Monitoring market sentiment...',
    signalsProcessed: 1247,
    accuracy: 78.5,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(asset => ({
        ...asset,
        price: asset.price + (Math.random() - 0.5) * 2,
        change: asset.change + (Math.random() - 0.5) * 0.5,
        sentiment: Math.max(0, Math.min(1, asset.sentiment + (Math.random() - 0.5) * 0.1)),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const totalValue = 127845.32;
  const todayChange = 2341.12;
  const todayChangePercent = 1.87;
  const overallSentiment = marketData.reduce((acc, asset) => acc + asset.sentiment, 0) / marketData.length;

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 text-sm font-medium">
              +${todayChange.toLocaleString()} ({todayChangePercent}%)
            </span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Bot Status</p>
              <p className="text-2xl font-bold text-green-400">Active</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <span className="text-slate-300 text-sm">{botStatus.lastAction}</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Accuracy</p>
              <p className="text-2xl font-bold text-white">{botStatus.accuracy}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4">
            <span className="text-slate-400 text-sm">{botStatus.signalsProcessed} signals processed</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Market Sentiment</p>
              <p className="text-2xl font-bold text-white">{(overallSentiment * 100).toFixed(1)}%</p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${overallSentiment > 0.6 ? 'text-green-500' : overallSentiment > 0.4 ? 'text-yellow-500' : 'text-red-500'}`} />
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${overallSentiment > 0.6 ? 'text-green-400' : overallSentiment > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
              {overallSentiment > 0.6 ? 'Bullish' : overallSentiment > 0.4 ? 'Neutral' : 'Bearish'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart />
        </div>
        <div>
          <SentimentGauge sentiment={overallSentiment} />
        </div>
      </div>

      {/* Assets and Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watched Assets */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Watched Assets</h3>
          <div className="space-y-3">
            {marketData.map((asset) => (
              <AssetCard key={asset.symbol} asset={asset} />
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
          <div className="space-y-3">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="text-white font-medium">{trade.symbol}</div>
                    <div className="text-slate-400 text-sm">
                      {trade.type.toUpperCase()} {trade.quantity} @ ${trade.price}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    ${(trade.quantity * trade.price).toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Sentiment: {(trade.sentiment * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;