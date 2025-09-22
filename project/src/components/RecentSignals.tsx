import React from 'react';
import { ArrowUp, ArrowDown, Minus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const RecentSignals: React.FC = () => {
  const { trades } = useTrading();

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <ArrowUp className="w-5 h-5 text-emerald-500" />;
      case 'SELL':
        return <ArrowDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-amber-500" />;
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Recent Trading Signals
      </h2>

      <div className="space-y-4">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              {getSignalIcon(trade.signal)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(trade.signal)}`}>
                    {trade.signal}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {trade.symbol}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ₹{trade.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {trade.reason}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Confidence</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {(trade.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Status</p>
                <div className="flex items-center space-x-1">
                  {trade.executed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={`text-xs ${trade.executed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {trade.executed ? 'Executed' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};