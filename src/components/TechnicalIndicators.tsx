import React from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const TechnicalIndicators: React.FC = () => {
  const { priceData, selectedSymbol } = useTrading();
  
  const latestData = priceData[priceData.length - 1];
  const indicators = latestData?.technicalIndicators;

  if (!indicators) return null;

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-600 dark:text-red-400';
    if (rsi < 30) return 'text-emerald-600 dark:text-emerald-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  const getRSILabel = (rsi: number) => {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
  };

  const getMACDSignal = (macd: number) => {
    if (macd > 0.5) return { label: 'Bullish', color: 'text-emerald-600', icon: TrendingUp };
    if (macd < -0.5) return { label: 'Bearish', color: 'text-red-600', icon: TrendingDown };
    return { label: 'Neutral', color: 'text-amber-600', icon: Activity };
  };

  const macdSignal = getMACDSignal(indicators.macd);
  const MACDIcon = macdSignal.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Technical Analysis - {selectedSymbol}
        </h2>
        <BarChart3 className="w-5 h-5 text-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* RSI */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">RSI (14)</h3>
            <span className={`text-xs font-medium ${getRSIColor(indicators.rsi)}`}>
              {getRSILabel(indicators.rsi)}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Value</span>
              <span className={`font-semibold ${getRSIColor(indicators.rsi)}`}>
                {indicators.rsi.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  indicators.rsi > 70 ? 'bg-red-500' :
                  indicators.rsi < 30 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${indicators.rsi}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>30</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* MACD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">MACD</h3>
            <div className="flex items-center space-x-1">
              <MACDIcon className={`w-3 h-3 ${macdSignal.color}`} />
              <span className={`text-xs font-medium ${macdSignal.color}`}>
                {macdSignal.label}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Value</span>
              <span className={`font-semibold ${macdSignal.color}`}>
                {indicators.macd.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 relative">
              <div className="absolute left-1/2 w-0.5 h-2 bg-gray-400 transform -translate-x-1/2"></div>
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  indicators.macd > 0 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.abs(indicators.macd) * 25 + 2}%`,
                  marginLeft: indicators.macd < 0 ? `${50 - Math.abs(indicators.macd) * 25}%` : '50%'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Moving Averages</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">SMA 20</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{indicators.sma20.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">SMA 50</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{indicators.sma50.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Trend</span>
              <span className={`font-semibold flex items-center space-x-1 ${
                indicators.sma20 > indicators.sma50 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {indicators.sma20 > indicators.sma50 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{indicators.sma20 > indicators.sma50 ? 'Bullish' : 'Bearish'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bollinger Bands</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Upper</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{indicators.bollinger.upper.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Middle</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{indicators.bollinger.middle.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Lower</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{indicators.bollinger.lower.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Position</span>
              <span className={`font-semibold flex items-center space-x-1 ${
                indicators.bollinger.middle > indicators.bollinger.upper ? 'text-red-600' :
                indicators.bollinger.middle < indicators.bollinger.lower ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                <Target className="w-3 h-3" />
                <span>
                  {indicators.bollinger.middle > indicators.bollinger.upper ? 'Above' :
                   indicators.bollinger.middle < indicators.bollinger.lower ? 'Below' : 'Within'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Technical Summary
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {indicators.rsi < 30 && indicators.macd > 0 
            ? "Strong buy signal: RSI oversold with bullish MACD crossover"
            : indicators.rsi > 70 && indicators.macd < 0
            ? "Caution: RSI overbought with bearish MACD divergence"
            : "Mixed signals: Monitor for clearer directional bias"}
        </p>
      </div>
    </div>
  );
};