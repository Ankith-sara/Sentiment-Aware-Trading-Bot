import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Minus, Calendar, DollarSign, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const TradeHistory: React.FC = () => {
  const { trades } = useTrading();
  const [dateFilter, setDateFilter] = useState('all');

  const executedTrades = trades.filter(trade => trade.executed);
  const totalTrades = executedTrades.length;
  const profitableTrades = executedTrades.filter(trade => trade.signal === 'BUY').length;
  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <ArrowUp className="w-4 h-4 text-emerald-500" />;
      case 'SELL':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-amber-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300';
      case 'SELL':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTrades}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{winRate.toFixed(1)}%</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(trades.reduce((sum, trade) => sum + trade.confidence, 0) / trades.length * 100).toFixed(0)}%
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Trade History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Trade History
          </h2>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Signal</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Symbol</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Confidence</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Sentiment</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2 sm:px-4">
                    <div className="flex items-center space-x-2">
                      {getSignalIcon(trade.signal)}
                      <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(trade.signal)}`}>
                        {trade.signal}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-sm">{trade.symbol}</td>
                  <td className="py-3 px-2 sm:px-4 text-gray-900 dark:text-white text-sm">₹{trade.price.toFixed(2)}</td>
                  <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${trade.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {(trade.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                    <span className={`font-medium ${
                      trade.sentimentScore > 0.2 ? 'text-emerald-600' :
                      trade.sentimentScore < -0.2 ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {trade.sentimentScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4">
                    <div className="flex items-center space-x-1">
                      {trade.executed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-xs hidden sm:inline ${trade.executed ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {trade.executed ? 'Executed' : 'Skipped'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};