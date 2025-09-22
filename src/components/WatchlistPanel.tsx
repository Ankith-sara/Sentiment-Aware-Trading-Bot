import React, { useState } from 'react';
import { Plus, X, Star, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const WatchlistPanel: React.FC = () => {
  const { watchlist, addToWatchlist, removeFromWatchlist, selectedSymbol, setSelectedSymbol } = useTrading();
  const [newSymbol, setNewSymbol] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSymbol = () => {
    if (newSymbol.trim() && !watchlist.includes(newSymbol.toUpperCase())) {
      addToWatchlist(newSymbol.toUpperCase());
      setNewSymbol('');
    }
  };

  const mockWatchlistData = watchlist.map(symbol => ({
    symbol,
    price: 2500 + Math.random() * 2000,
    change: (Math.random() - 0.5) * 200,
    changePercent: (Math.random() - 0.5) * 5,
    sentiment: (Math.random() - 0.5) * 2,
    volume: Math.floor(Math.random() * 1000000) + 500000,
  }));

  const filteredWatchlist = mockWatchlistData.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Watchlist
        </h2>
        <Star className="w-5 h-5 text-amber-500" />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search symbols..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Add Symbol */}
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
          placeholder="Add symbol (e.g., TSLA)"
          placeholder="Add symbol (e.g., HDFCBANK)"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
        <button
          onClick={handleAddSymbol}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Watchlist Items */}
      <div className="space-y-3">
        {filteredWatchlist.map((item) => (
          <div
            key={item.symbol}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedSymbol === item.symbol
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700'
            }`}
            onClick={() => setSelectedSymbol(item.symbol)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {item.symbol.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {item.symbol}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Vol: {(item.volume / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ₹{item.price.toFixed(2)}
                </p>
                <div className="flex items-center space-x-2">
                  {item.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    item.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchlist(item.symbol);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sentiment Indicator */}
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Sentiment:</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    item.sentiment > 0 ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.abs(item.sentiment) * 50 + 50}%`,
                    marginLeft: item.sentiment < 0 ? `${(1 + item.sentiment) * 50}%` : '0'
                  }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${
                item.sentiment > 0.2 ? 'text-emerald-600' :
                item.sentiment < -0.2 ? 'text-red-600' : 'text-amber-600'
              }`}>
                {item.sentiment.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};