import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Filter, Download, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  sentiment: number;
  pnl: number;
  status: 'completed' | 'pending' | 'cancelled';
}

const TradingHistory: React.FC = () => {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trading history on component mount
  React.useEffect(() => {
    const fetchTradingHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tradesResponse = await apiService.getTradingHistory();
        const formattedTrades = tradesResponse.map(trade => ({
          ...trade,
          timestamp: new Date(trade.timestamp)
        }));
        
        setTrades(formattedTrades);
      } catch (err) {
        console.error('Error fetching trading history:', err);
        setError('Failed to load trading history');
        
        // Fallback to mock data
        setTrades([
          {
            id: '1',
            symbol: 'AAPL',
            type: 'buy',
            quantity: 100,
            price: 176.88,
            total: 17688.00,
            timestamp: new Date('2024-01-15T10:30:00'),
            sentiment: 0.78,
            pnl: 234.40,
            status: 'completed'
          },
          {
            id: '2',
            symbol: 'NVDA',
            type: 'sell',
            quantity: 50,
            price: 718.45,
            total: 35922.50,
            timestamp: new Date('2024-01-15T09:45:00'),
            sentiment: 0.82,
            pnl: 1245.80,
            status: 'completed'
          },
          {
            id: '3',
            symbol: 'TSLA',
            type: 'sell',
            quantity: 25,
            price: 248.32,
            total: 6208.00,
            timestamp: new Date('2024-01-14T14:20:00'),
            sentiment: 0.35,
            pnl: -156.75,
            status: 'completed'
          },
          {
            id: '4',
            symbol: 'MSFT',
            type: 'buy',
            quantity: 75,
            price: 335.22,
            total: 25141.50,
            timestamp: new Date('2024-01-14T11:15:00'),
            sentiment: 0.65,
            pnl: 456.30,
            status: 'completed'
          },
          {
            id: '5',
            symbol: 'GOOGL',
            type: 'buy',
            quantity: 30,
            price: 142.87,
            total: 4286.10,
            timestamp: new Date('2024-01-13T16:30:00'),
            sentiment: 0.71,
            pnl: 0,
            status: 'pending'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingHistory();
  }, []);

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'buy') return trade.type === 'buy';
    if (filter === 'sell') return trade.type === 'sell';
    if (filter === 'profit') return trade.pnl > 0;
    if (filter === 'loss') return trade.pnl < 0;
    return true;
  });

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalTrades = trades.length;
  const winRate = (trades.filter(t => t.pnl > 0).length / trades.length * 100).toFixed(1);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className={`ml-4 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading trading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className={`rounded-lg p-4 border ${
          isDark 
            ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' 
            : 'bg-yellow-100 border-yellow-300 text-yellow-800'
        }`}>
          <p className="text-sm">{error} - Showing demo data</p>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-2xl shadow-xl border p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>

        <div className={`rounded-2xl shadow-xl border p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Trades</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalTrades}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className={`rounded-2xl shadow-xl border p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Win Rate</p>
              <p className="text-2xl font-bold text-green-400">{winRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Trading History</h2>
          
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                <option value="all">All Trades</option>
                <option value="buy">Buy Orders</option>
                <option value="sell">Sell Orders</option>
                <option value="profit">Profitable</option>
                <option value="loss">Loss Making</option>
              </select>
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trading Table */}
      <div className={`rounded-2xl shadow-xl border overflow-hidden ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Asset</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sentiment</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>P&L</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className={`transition-colors duration-300 ${
                  isDark 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                }`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-gray-700'}`}>
                          {trade.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{trade.symbol}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                      trade.type === 'buy' 
                        ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{trade.quantity}</td>
                  <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>${trade.price.toFixed(2)}</td>
                  <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>${trade.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        trade.sentiment >= 0.6 ? 'text-green-400' : 
                        trade.sentiment >= 0.4 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {(trade.sentiment * 100).toFixed(0)}%
                      </span>
                      <div className={`w-8 h-1 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                        <div 
                          className={`h-full rounded ${
                            trade.sentiment >= 0.6 ? 'bg-green-400' : 
                            trade.sentiment >= 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${trade.sentiment * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                  </td>
                  <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {trade.timestamp.toLocaleDateString()} {trade.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.status === 'completed' 
                        ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                        : trade.status === 'pending' 
                        ? isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                        : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.status}
                    </span>
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

export default TradingHistory;