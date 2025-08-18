import React from 'react';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';

interface SentimentGaugeProps {
  sentiment: number; // 0 to 1
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ sentiment }) => {
  const percentage = sentiment * 100;
  const rotation = (sentiment - 0.5) * 180; // -90 to +90 degrees
  
  const getSentimentLabel = (value: number) => {
    if (value >= 0.7) return 'Very Bullish';
    if (value >= 0.6) return 'Bullish';
    if (value >= 0.4) return 'Neutral';
    if (value >= 0.3) return 'Bearish';
    return 'Very Bearish';
  };

  const getSentimentColor = (value: number) => {
    if (value >= 0.6) return 'text-green-400';
    if (value >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentBgColor = (value: number) => {
    if (value >= 0.6) return 'bg-green-500';
    if (value >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Brain className="w-5 h-5 mr-2 text-blue-500" />
          Market Sentiment
        </h3>
        {sentiment >= 0.5 ? (
          <TrendingUp className="w-5 h-5 text-green-400" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-400" />
        )}
      </div>

      {/* Gauge */}
      <div className="relative w-64 h-32 mx-auto mb-6">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Colored segments */}
          <path
            d="M 20 80 A 80 80 0 0 1 60 30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 60 30 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 100 20 A 80 80 0 0 1 140 30"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 140 30 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#059669"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Needle */}
          <g transform={`translate(100, 80) rotate(${rotation})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-60"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="6" fill="#ffffff" />
          </g>

          {/* Center dot */}
          <circle cx="100" cy="80" r="4" fill="#374151" />
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 text-xs text-red-400 font-medium">
          Bearish
        </div>
        <div className="absolute bottom-0 right-0 text-xs text-green-400 font-medium">
          Bullish
        </div>
      </div>

      {/* Current Value */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-white">{percentage.toFixed(1)}%</div>
          <div className={`text-lg font-semibold ${getSentimentColor(sentiment)}`}>
            {getSentimentLabel(sentiment)}
          </div>
        </div>

        {/* Sentiment History */}
        <div className="grid grid-cols-7 gap-1">
          {[0.65, 0.72, 0.58, 0.45, 0.67, 0.73, sentiment].map((value, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div 
                className={`w-full h-8 ${getSentimentBgColor(value)} rounded-sm opacity-${index === 6 ? '100' : '60'}`}
                style={{ height: `${value * 32}px` }}
              ></div>
              <div className="text-xs text-slate-500">
                {index === 6 ? 'Now' : `${7-index}d`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Factors */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-slate-300">Key Factors</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">News Sentiment</span>
            <span className="text-green-400">+73%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Social Media</span>
            <span className="text-yellow-400">+45%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Technical Analysis</span>
            <span className="text-green-400">+68%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentGauge;