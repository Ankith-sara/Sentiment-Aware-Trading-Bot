import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Filter, Download, Calendar } from 'lucide-react';

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
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  const trades: Trade[] = [
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
  ];

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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total P&L</p>
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

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Trades</p>
              <p className="text-2xl font-bold text-white">{totalTrades}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Win Rate</p>
              <p className="text-2xl font-bold text-green-400">{winRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-white">Trading History</h2>
          
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
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
              className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trading Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Asset</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Price</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Total</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Sentiment</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">P&L</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-700 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{trade.symbol.substring(0, 2)}</span>
                      </div>
                      <span className="text-white font-medium">{trade.symbol}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                      trade.type === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{trade.quantity}</td>
                  <td className="py-3 px-4 text-white">${trade.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-white">${trade.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        trade.sentiment >= 0.6 ? 'text-green-400' : 
                        trade.sentiment >= 0.4 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {(trade.sentiment * 100).toFixed(0)}%
                      </span>
                      <div className="w-8 h-1 bg-slate-600 rounded">
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
                      trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {trade.timestamp.toLocaleDateString()} {trade.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.status === 'completed' ? 'bg-green-900 text-green-300' :
                      trade.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
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