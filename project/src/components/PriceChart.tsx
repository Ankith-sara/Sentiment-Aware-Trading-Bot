import React, { useRef, useEffect } from 'react';
import { useTrading } from '../contexts/TradingContext';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export const PriceChart: React.FC = () => {
  const { priceData, selectedSymbol } = useTrading();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with proper scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (priceData.length === 0) {
      // Show loading state
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Loading market data...', rect.width / 2, rect.height / 2);
      return;
    }

    const padding = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate price range with padding for candlesticks
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    const minPrice = Math.min(...lows);
    const maxPrice = Math.max(...highs);
    const priceRange = maxPrice - minPrice;
    const paddedMin = minPrice - priceRange * 0.05;
    const paddedMax = maxPrice + priceRange * 0.05;
    const paddedRange = paddedMax - paddedMin;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (chartWidth / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, rect.height - padding.bottom);
      ctx.stroke();
    }

    // Draw candlesticks
    const candleWidth = Math.max(2, (chartWidth / priceData.length) * 0.8);
    
    priceData.forEach((data, i) => {
      const x = padding.left + (chartWidth / (priceData.length - 1)) * i;
      
      // Calculate y positions
      const openY = padding.top + chartHeight - ((data.open - paddedMin) / paddedRange) * chartHeight;
      const highY = padding.top + chartHeight - ((data.high - paddedMin) / paddedRange) * chartHeight;
      const lowY = padding.top + chartHeight - ((data.low - paddedMin) / paddedRange) * chartHeight;
      const closeY = padding.top + chartHeight - ((data.close - paddedMin) / paddedRange) * chartHeight;
      
      // Determine candle color
      const isGreen = data.close > data.open;
      const candleColor = isGreen ? '#10b981' : '#ef4444';
      const wickColor = '#6b7280';
      
      // Draw wick (high-low line)
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Draw candle body
      ctx.fillStyle = candleColor;
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1;
      
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      
      if (bodyHeight < 1) {
        // Doji candle (open = close)
        ctx.beginPath();
        ctx.moveTo(x - candleWidth / 2, openY);
        ctx.lineTo(x + candleWidth / 2, openY);
        ctx.stroke();
      } else {
        // Regular candle
        if (isGreen) {
          ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        } else {
          ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        }
      }
    });

    // Draw sentiment indicators
    priceData.forEach((data, i) => {
      const x = padding.left + (chartWidth / (priceData.length - 1)) * i;
      const y = padding.top + chartHeight - ((data.close - paddedMin) / paddedRange) * chartHeight;
      
      // Sentiment color with intensity
      let color = '#f59e0b';
      let size = 3;
      
      if (data.sentiment > 0.2) {
        color = '#10b981';
        size = 3 + Math.abs(data.sentiment) * 2;
      } else if (data.sentiment < -0.2) {
        color = '#ef4444';
        size = 3 + Math.abs(data.sentiment) * 2;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y - 10, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add white border for better visibility
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw price labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = paddedMin + (paddedRange / 5) * (5 - i);
      const y = padding.top + (chartHeight / 5) * i + 4;
      ctx.fillText(`₹${price.toFixed(2)}`, padding.left - 10, y);
    }

    // Draw time labels
    ctx.textAlign = 'center';
    const timePoints = [0, Math.floor(priceData.length / 4), Math.floor(priceData.length / 2), Math.floor(priceData.length * 3 / 4), priceData.length - 1];
    
    timePoints.forEach(index => {
      if (index < priceData.length) {
        const x = padding.left + (chartWidth / (priceData.length - 1)) * index;
        const time = new Date(priceData[index].timestamp);
        ctx.fillText(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, rect.height - 10);
      }
    });

  }, [priceData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
            {selectedSymbol} Price Chart with Sentiment
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Bullish Candle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Bearish Candle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Sentiment Overlay</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Activity className="w-3 h-3" />
            <span>Live Data</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64 lg:h-80 w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Timeframe:</span>
          <select className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs">
            <option>1D</option>
            <option>5D</option>
            <option>1M</option>
            <option>3M</option>
          </select>
          <span className="ml-4">Chart Type:</span>
          <select className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs">
            <option>Candlestick</option>
            <option>Line</option>
            <option>Area</option>
          </select>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last candle: {priceData.length > 0 ? new Date(priceData[priceData.length - 1].timestamp).toLocaleTimeString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};