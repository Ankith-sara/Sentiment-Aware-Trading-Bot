import React, { useState } from 'react';
import { Play, DollarSign, TrendingUp, BarChart3, Download, TrendingDown } from 'lucide-react';

interface BacktestResult {
  id: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: any[];
  equity: Array<{
    date: string;
    value: number;
  }>;
}

export const BacktestPanel: React.FC = () => {
  const [backtestConfig, setBacktestConfig] = useState({
    symbol: 'AAPL',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    initialCapital: 10000,
    buyThreshold: 0.2,
    sellThreshold: -0.2,
    sentimentWeight: 0.6,
    technicalWeight: 0.4,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    
    // Simulate backtest processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock backtest results
    const mockResult: BacktestResult = {
      id: `backtest-${Date.now()}`,
      symbol: backtestConfig.symbol,
      startDate: backtestConfig.startDate,
      endDate: backtestConfig.endDate,
      initialCapital: backtestConfig.initialCapital,
      finalValue: backtestConfig.initialCapital * 1.15,
      totalReturn: backtestConfig.initialCapital * 0.15,
      totalReturnPercent: 15.2,
      maxDrawdown: -8.5,
      sharpeRatio: 1.34,
      trades: [],
      equity: Array.from({ length: 252 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString(),
        value: backtestConfig.initialCapital * (1 + (Math.random() - 0.3) * 0.5)
      }))
    };

    setResults(mockResult);
    setIsRunning(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Backtest Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Strategy Backtesting
        </h2>

        {/* Basic Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Symbol
            </label>
            <input
              type="text"
              value={backtestConfig.symbol}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
              placeholder="e.g., AAPL"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              value={backtestConfig.startDate}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              value={backtestConfig.endDate}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Initial Capital
            </label>
            <input
              type="number"
              value={backtestConfig.initialCapital}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, initialCapital: parseInt(e.target.value) }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
              placeholder="10000"
            />
          </div>
        </div>

        {/* Advanced Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Buy Threshold
            </label>
            <input
              type="number"
              step="0.1"
              min="-1"
              max="1"
              value={backtestConfig.buyThreshold}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, buyThreshold: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sell Threshold
            </label>
            <input
              type="number"
              step="0.1"
              min="-1"
              max="1"
              value={backtestConfig.sellThreshold}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, sellThreshold: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sentiment Weight
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={backtestConfig.sentimentWeight}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, sentimentWeight: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Technical Weight
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={backtestConfig.technicalWeight}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, technicalWeight: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base sm:text-sm"
            />
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={runBacktest}
          disabled={isRunning}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 min-h-[48px] text-base sm:text-sm"
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Backtest...' : 'Run Backtest'}</span>
        </button>
      </div>

      {/* Backtest Results */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Backtest Results - {results.symbol}
            </h3>
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export Results</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Final Value</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                ₹{results.finalValue.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Return</p>
              <p className={`text-base sm:text-lg font-bold ${results.totalReturnPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {results.totalReturnPercent >= 0 ? '+' : ''}{results.totalReturnPercent.toFixed(2)}%
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Sharpe Ratio</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {results.sharpeRatio.toFixed(2)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
              <p className="text-base sm:text-lg font-bold text-red-600">
                {results.maxDrawdown.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
              Strategy Performance Summary
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              The sentiment-aware strategy generated a <span className="font-semibold text-emerald-600">{results.totalReturnPercent.toFixed(2)}%</span> return over the test period,
              outperforming a buy-and-hold approach by approximately <span className="font-semibold">3.8%</span>. The Sharpe ratio of <span className="font-semibold">{results.sharpeRatio.toFixed(2)}</span> indicates good risk-adjusted returns with manageable volatility.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};