import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const Portfolio: React.FC = () => {
  const { portfolio, watchlist, selectedSymbol, setSelectedSymbol } = useTrading();
  const [view, setView] = useState<'positions' | 'performance' | 'allocation'>('positions');

  const totalUnrealizedPnL = portfolio.positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalUnrealizedPercent = (totalUnrealizedPnL / (portfolio.totalValue - totalUnrealizedPnL)) * 100;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${portfolio.totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily P&L</p>
              <p className={`text-2xl font-bold ${portfolio.dailyPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {portfolio.dailyPnL >= 0 ? '+' : ''}${portfolio.dailyPnL.toFixed(2)}
              </p>
            </div>
            {portfolio.dailyPnL >= 0 ? (
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Return</p>
              <p className={`text-2xl font-bold ${portfolio.performance.totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {portfolio.performance.totalReturnPercent.toFixed(2)}%
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cash Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${portfolio.cashBalance.toLocaleString()}
              </p>
            </div>
            <PieChart className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
          {[
            { id: 'positions', label: 'Positions', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'allocation', label: 'Allocation', icon: PieChart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`flex items-center space-x-2 px-4 lg:px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap min-w-0 ${
                  view === tab.id
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {view === 'positions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Positions
              </h3>
              
              {portfolio.positions.map((position) => (
                <div
                  key={position.symbol}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer space-y-2 sm:space-y-0"
                  onClick={() => setSelectedSymbol(position.symbol)}
                >
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {position.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {position.symbol}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {position.quantity} shares @ ${position.avgPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${position.marketValue.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        position.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                      </span>
                      <span className={`text-xs ${
                        position.unrealizedPnLPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        ({position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-gray-600 dark:text-gray-400">Total Return</span>
                    <span className={`font-semibold ${portfolio.performance.totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${portfolio.performance.totalReturn.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {portfolio.performance.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                    <span className="font-semibold text-red-600">
                      {portfolio.performance.maxDrawdown.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="font-semibold text-emerald-600">
                      {portfolio.performance.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-gray-600 dark:text-gray-400">Profit Factor</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {portfolio.performance.profitFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-gray-600 dark:text-gray-400">Avg Win/Loss</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{portfolio.performance.avgWin.toFixed(0)}/₹{Math.abs(portfolio.performance.avgLoss).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'allocation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Portfolio Allocation
              </h3>
              
              <div className="space-y-4">
                {portfolio.positions.map((position) => {
                  const allocation = (position.marketValue / portfolio.totalValue) * 100;
                  return (
                    <div key={position.symbol} className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {position.symbol}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {allocation.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${allocation}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="font-medium text-gray-900 dark:text-white">Cash</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {((portfolio.cashBalance / portfolio.totalValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(portfolio.cashBalance / portfolio.totalValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};