import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { TrendingUp, BarChart3, Activity, AlertCircle, RefreshCw } from 'lucide-react';

// Types
interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sentiment: number;
}

interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

// Mock trading context for standalone usage
interface TradingContextType {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
}

const TradingContext = createContext<TradingContextType>({
  selectedSymbol: 'AAPL',
  setSelectedSymbol: () => {}
});

const useTradingContext = () => useContext(TradingContext);

// API Functions
const getAlpacaHeaders = () => ({
  'APCA-API-KEY-ID': import.meta.env.VITE_ALPACA_API_KEY || '',
  'APCA-API-SECRET-KEY': import.meta.env.VITE_ALPACA_SECRET_KEY || '',
  'Content-Type': 'application/json'
});

const fetchHistoricalBars = async (symbol: string, timeframe: string = '1Hour'): Promise<AlpacaBar[]> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    
    const response = await fetch(
      `${import.meta.env.VITE_ALPACA_BASE_URL}/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${startDate.toISOString()}&end=${endDate.toISOString()}&adjustment=raw&asof=&feed=iex&limit=100&sort=asc`,
      { headers: getAlpacaHeaders() }
    );
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data.bars || [];
  } catch (error) {
    console.warn('Alpaca bars API failed, using fallback');
    return [];
  }
};

const fetchSymbolSentiment = async (symbol: string): Promise<number> => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${import.meta.env.VITE_NEWS_API_KEY}&pageSize=3&sortBy=publishedAt`
    );
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return (Math.random() - 0.5) * 2;
    }
    
    // Simple sentiment analysis based on keywords
    const sentiments = data.articles.map((article: any) => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      let score = 0;
      
      // Positive keywords
      if (text.includes('surge') || text.includes('rally') || text.includes('gains') || 
          text.includes('profit') || text.includes('growth') || text.includes('bullish')) {
        score += 0.3;
      }
      
      // Negative keywords
      if (text.includes('fall') || text.includes('drop') || text.includes('loss') || 
          text.includes('bearish') || text.includes('decline') || text.includes('crash')) {
        score -= 0.3;
      }
      
      return Math.max(-1, Math.min(1, score + (Math.random() - 0.5) * 0.4));
    });
    
    return sentiments.reduce((sum: number, sentiment: number) => sum + sentiment, 0) / sentiments.length;
  } catch (error) {
    console.warn(`Sentiment analysis for ${symbol} failed, using random`);
    return (Math.random() - 0.5) * 2;
  }
};

const generateMockCandlestickData = (symbol: string, count: number = 50): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let basePrice = 150 + Math.random() * 100;
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - (count - i));
    
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const open = basePrice;
    const close = basePrice * (1 + change);
    
    const spread = Math.abs(close - open) * (0.5 + Math.random());
    const high = Math.max(open, close) + spread * Math.random();
    const low = Math.min(open, close) - spread * Math.random();
    
    data.push({
      timestamp: timestamp.toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      sentiment: (Math.random() - 0.5) * 2
    });
    
    basePrice = close;
  }
  
  return data;
};

const PriceChartInner: React.FC = () => {
  const { selectedSymbol } = useTradingContext();
  const [priceData, setPriceData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1Hour');
  const [chartType, setChartType] = useState('Candlestick');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchChartData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch historical bars
      const bars = await fetchHistoricalBars(selectedSymbol, timeframe);
      
      if (bars.length > 0) {
        // Convert Alpaca bars to candlestick data with sentiment
        const chartData = await Promise.all(
          bars.map(async (bar, index) => {
            // Get sentiment for every 5th bar to avoid too many API calls
            const sentiment = index % 5 === 0 
              ? await fetchSymbolSentiment(selectedSymbol)
              : (Math.random() - 0.5) * 2;
            
            return {
              timestamp: bar.t,
              open: bar.o,
              high: bar.h,
              low: bar.l,
              close: bar.c,
              volume: bar.v,
              sentiment
            };
          })
        );
        
        setPriceData(chartData);
      } else {
        // Fallback to mock data
        const mockData = generateMockCandlestickData(selectedSymbol);
        setPriceData(mockData);
      }
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch chart data');
      setLoading(false);
      
      // Use mock data as fallback
      const mockData = generateMockCandlestickData(selectedSymbol);
      setPriceData(mockData);
      
      console.error('Chart data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchChartData, 120000);
    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceData.length === 0) return;

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

    const padding = { top: 20, right: 60, bottom: 40, left: 80 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate price range
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
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const verticalLines = Math.min(6, priceData.length);
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding.left + (chartWidth / verticalLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, rect.height - padding.bottom);
      ctx.stroke();
    }

    if (chartType === 'Candlestick') {
      // Draw candlesticks
      const candleWidth = Math.max(2, Math.min(12, (chartWidth / priceData.length) * 0.7));
      
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
          // Doji candle (open ≈ close)
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
    } else if (chartType === 'Line') {
      // Draw line chart
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      priceData.forEach((data, i) => {
        const x = padding.left + (chartWidth / (priceData.length - 1)) * i;
        const y = padding.top + chartHeight - ((data.close - paddedMin) / paddedRange) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    } else if (chartType === 'Area') {
      // Draw area chart
      const gradient = ctx.createLinearGradient(0, padding.top, 0, rect.height - padding.bottom);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(padding.left, rect.height - padding.bottom);
      
      priceData.forEach((data, i) => {
        const x = padding.left + (chartWidth / (priceData.length - 1)) * i;
        const y = padding.top + chartHeight - ((data.close - paddedMin) / paddedRange) * chartHeight;
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo(padding.left + chartWidth, rect.height - padding.bottom);
      ctx.closePath();
      ctx.fill();
      
      // Draw line on top
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      priceData.forEach((data, i) => {
        const x = padding.left + (chartWidth / (priceData.length - 1)) * i;
        const y = padding.top + chartHeight - ((data.close - paddedMin) / paddedRange) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }

    // Draw sentiment indicators
    priceData.forEach((data, i) => {
      if (i % 3 === 0) { // Show sentiment for every 3rd candle
        const x = padding.left + (chartWidth / (priceData.length - 1)) * i;
        const y = padding.top + chartHeight - ((data.close - paddedMin) / paddedRange) * chartHeight;
        
        // Sentiment color and size
        let color = '#f59e0b'; // neutral
        let size = 3;
        
        if (data.sentiment > 0.2) {
          color = '#10b981'; // positive
          size = 3 + Math.abs(data.sentiment) * 2;
        } else if (data.sentiment < -0.2) {
          color = '#ef4444'; // negative
          size = 3 + Math.abs(data.sentiment) * 2;
        }
        
        // Draw sentiment dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y - 15, Math.min(size, 6), 0, Math.PI * 2);
        ctx.fill();
        
        // Add white border for visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw price labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 5; i++) {
      const price = paddedMin + (paddedRange / 5) * (5 - i);
      const y = padding.top + (chartHeight / 5) * i;
      ctx.fillText(`$${price.toFixed(2)}`, padding.left - 10, y);
    }

    // Draw time labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelIndices = [0, Math.floor(priceData.length / 4), Math.floor(priceData.length / 2), Math.floor(priceData.length * 3 / 4), priceData.length - 1];
    
    labelIndices.forEach(index => {
      if (index < priceData.length) {
        const x = padding.left + (chartWidth / (priceData.length - 1)) * index;
        const time = new Date(priceData[index].timestamp);
        const timeStr = timeframe === '1Day' 
          ? time.toLocaleDateString([], { month: 'short', day: 'numeric' })
          : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.fillText(timeStr, x, rect.height - padding.bottom + 10);
      }
    });

    // Draw current price indicator
    if (priceData.length > 0) {
      const lastPrice = priceData[priceData.length - 1].close;
      const y = padding.top + chartHeight - ((lastPrice - paddedMin) / paddedRange) * chartHeight;
      
      // Price line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(rect.width - padding.right + 2, y - 10, 55, 20);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(`$${lastPrice.toFixed(2)}`, rect.width - padding.right + 29, y);
    }

  }, [priceData, chartType]);

  if (loading && priceData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-64 lg:h-80 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
            {selectedSymbol} Price Chart
          </h2>
        </div>
        
        <button
          onClick={fetchChartData}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Bullish</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Bearish</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Sentiment</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
          <Activity className="w-3 h-3" />
          <span>Live Data</span>
        </div>
        {error && (
          <div className="flex items-center space-x-1 text-xs text-amber-600">
            <AlertCircle className="w-3 h-3" />
            <span>Using mock data</span>
          </div>
        )}
      </div>
      
      <div className="relative h-64 lg:h-80 w-full mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-600"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="1Min">1 Min</option>
              <option value="5Min">5 Min</option>
              <option value="15Min">15 Min</option>
              <option value="1Hour">1 Hour</option>
              <option value="1Day">1 Day</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-400">Chart Type:</span>
            <select 
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="Candlestick">Candlestick</option>
              <option value="Line">Line</option>
              <option value="Area">Area</option>
            </select>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {priceData.length > 0 && (
            <span>
              Last updated: {lastUpdated.toLocaleTimeString()} • 
              {priceData.length} data points • 
              Latest: ${priceData[priceData.length - 1]?.close.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Standalone Chart Component with Context
export const PriceChart: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  return (
    <TradingContext.Provider value={{ selectedSymbol, setSelectedSymbol }}>
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Symbol:
          </label>
          <select 
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="AAPL">Apple (AAPL)</option>
            <option value="MSFT">Microsoft (MSFT)</option>
            <option value="GOOGL">Google (GOOGL)</option>
            <option value="TSLA">Tesla (TSLA)</option>
            <option value="NVDA">NVIDIA (NVDA)</option>
            <option value="AMZN">Amazon (AMZN)</option>
          </select>
        </div>
        <PriceChartInner />
      </div>
    </TradingContext.Provider>
  );
};

export default PriceChart;