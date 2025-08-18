import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  time: string;
  price: number;
  sentiment: number;
}

const PriceChart: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Generate mock chart data
  useEffect(() => {
    const generateData = () => {
      const data: ChartData[] = [];
      const basePrice = 178;
      let currentPrice = basePrice;
      
      for (let i = 0; i < 24; i++) {
        const change = (Math.random() - 0.5) * 4;
        currentPrice += change;
        data.push({
          time: `${i}:00`,
          price: currentPrice,
          sentiment: Math.random() * 0.4 + 0.4, // 0.4 to 0.8
        });
      }
      return data;
    };

    setChartData(generateData());
  }, [selectedAsset, timeframe]);

  const currentPrice = chartData[chartData.length - 1]?.price || 178.32;
  const previousPrice = chartData[chartData.length - 2]?.price || 175.87;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Price Chart</h3>
          <div className="flex items-center space-x-4 mt-2">
            <select 
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="AAPL">AAPL</option>
              <option value="TSLA">TSLA</option>
              <option value="MSFT">MSFT</option>
              <option value="NVDA">NVDA</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</span>
              <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {['1H', '1D', '1W', '1M'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-80 bg-slate-900 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 800 300">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="80" height="30" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 30" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="800" height="300" fill="url(#grid)" />

          {/* Price line */}
          {chartData.length > 1 && (
            <path
              d={`M ${chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 760 + 20;
                const y = 280 - ((point.price - minPrice) / priceRange) * 260;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}`}
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          )}

          {/* Sentiment bars */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 760 + 18;
            const barHeight = point.sentiment * 40;
            return (
              <rect
                key={index}
                x={x}
                y={300 - barHeight}
                width="4"
                height={barHeight}
                fill="#3b82f6"
                opacity="0.6"
                className="transition-all duration-300 hover:opacity-100"
              />
            );
          })}

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 760 + 20;
            const y = 280 - ((point.price - minPrice) / priceRange) * 260;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={isPositive ? '#10b981' : '#ef4444'}
                className="transition-all duration-300 hover:r-5"
              >
                <title>{`${point.time}: $${point.price.toFixed(2)} (Sentiment: ${(point.sentiment * 100).toFixed(0)}%)`}</title>
              </circle>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span>Price</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-2 bg-blue-500 opacity-60"></div>
            <span>Sentiment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;