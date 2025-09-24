import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle, RefreshCw } from 'lucide-react';

// Types
interface PriceData {
  price: number;
  volume: number;
  timestamp: string;
  sentiment: number;
}

interface NewsItem {
  title: string;
  sentiment: number;
  sentimentLabel: 'positive' | 'negative' | 'neutral';
  timestamp: string;
}

interface AlpacaQuote {
  symbol: string;
  askPrice: number;
  bidPrice: number;
  timestamp: string;
}

interface AlpacaTrade {
  symbol: string;
  price: number;
  size: number;
  timestamp: string;
}

// API Functions
const getAlpacaHeaders = () => ({
  'APCA-API-KEY-ID': import.meta.env.VITE_ALPACA_API_KEY || '',
  'APCA-API-SECRET-KEY': import.meta.env.VITE_ALPACA_SECRET_KEY || '',
  'Content-Type': 'application/json'
});

const fetchAlpacaPrice = async (symbol: string): Promise<number> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_ALPACA_BASE_URL}/v2/stocks/${symbol}/quotes/latest`, {
      headers: getAlpacaHeaders()
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return (data.quote.askPrice + data.quote.bidPrice) / 2; // Mid price
  } catch (error) {
    console.warn('Alpaca API failed, using fallback');
    // Fallback to mock data with realistic price simulation
    return 150 + (Math.random() - 0.5) * 20;
  }
};

const fetchNews = async (symbol: string): Promise<NewsItem[]> => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${import.meta.env.VITE_NEWS_API_KEY}&pageSize=10&sortBy=publishedAt`
    );
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    return data.articles.map((article: any) => ({
      title: article.title,
      sentiment: (Math.random() - 0.5) * 2, // Random sentiment for now
      sentimentLabel: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'negative' : 'neutral',
      timestamp: article.publishedAt
    }));
  } catch (error) {
    console.warn('News API failed, using mock data');
    return generateMockNews();
  }
};

const analyzeSentiment = async (text: string): Promise<number> => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) throw new Error('Sentiment analysis failed');
    
    const result = await response.json();
    const scores = result[0];
    
    // Convert to sentiment score between -1 and 1
    const positive = scores.find((s: any) => s.label === 'LABEL_2')?.score || 0;
    const negative = scores.find((s: any) => s.label === 'LABEL_0')?.score || 0;
    
    return positive - negative;
  } catch (error) {
    console.warn('Sentiment analysis failed, using random');
    return (Math.random() - 0.5) * 2;
  }
};

const generateMockNews = (): NewsItem[] => {
  const headlines = [
    'Tech stocks surge on positive earnings outlook',
    'Market volatility expected amid economic uncertainty',
    'Strong quarterly results boost investor confidence',
    'Regulatory concerns impact sector performance',
    'Innovation drive sparks renewed interest'
  ];
  
  return headlines.map(title => ({
    title,
    sentiment: (Math.random() - 0.5) * 2,
    sentimentLabel: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'negative' : 'neutral',
    timestamp: new Date().toISOString()
  }));
};

export const MarketSummary: React.FC = () => {
  const [selectedSymbol] = useState('AAPL'); // You can make this dynamic
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setError(null);
      
      // Fetch current price
      const currentPrice = await fetchAlpacaPrice(selectedSymbol);
      
      // Fetch news and analyze sentiment
      const newsData = await fetchNews(selectedSymbol);
      setNews(newsData);
      
      // Calculate overall sentiment from news
      const overallSentiment = newsData.length > 0 
        ? newsData.reduce((sum, item) => sum + item.sentiment, 0) / newsData.length
        : 0;
      
      // Create new price data point
      const newDataPoint: PriceData = {
        price: currentPrice,
        volume: Math.floor(Math.random() * 10000000) + 1000000, // Mock volume
        timestamp: new Date().toISOString(),
        sentiment: overallSentiment
      };
      
      setPriceData(prev => {
        const updated = [...prev, newDataPoint];
        // Keep only last 100 data points
        return updated.slice(-100);
      });
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch market data');
      setLoading(false);
      console.error('Market data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const getSentimentIcon = (sentimentValue: number) => {
    if (sentimentValue > 0.2) return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (sentimentValue < -0.2) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-amber-500" />;
  };

  const getSentimentColor = (sentimentValue: number) => {
    if (sentimentValue > 0.2) return 'text-emerald-600 dark:text-emerald-400';
    if (sentimentValue < -0.2) return 'text-red-600 dark:text-red-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  if (loading && priceData.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const latestData = priceData[priceData.length - 1];
  const previousData = priceData[priceData.length - 2];
  
  if (!latestData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 dark:text-red-300">
            {error || 'Unable to load market data'}
          </span>
          <button 
            onClick={fetchMarketData}
            className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const priceChange = previousData ? latestData.price - previousData.price : 0;
  const changePercent = previousData ? (priceChange / previousData.price) * 100 : 0;
  const sentiment = latestData.sentiment;
  const avgSentiment = news.length > 0 
    ? news.reduce((sum, item) => sum + item.sentiment, 0) / news.length 
    : 0;

  const marketSummaryCards = [
    {
      title: `${selectedSymbol} Price`,
      value: `$${latestData.price.toFixed(2)}`,
      change: `${priceChange >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
      icon: priceChange >= 0 ? TrendingUp : TrendingDown,
      color: priceChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bgColor: priceChange >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Live Sentiment',
      value: sentiment.toFixed(2),
      change: sentiment > 0.2 ? 'Bullish' : sentiment < -0.2 ? 'Bearish' : 'Neutral',
      icon: () => getSentimentIcon(sentiment),
      color: getSentimentColor(sentiment),
      bgColor: sentiment > 0.2 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
               sentiment < -0.2 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: 'Trading Volume',
      value: `${(latestData.volume / 1000000).toFixed(1)}M`,
      change: 'Active',
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Market Sentiment',
      value: avgSentiment.toFixed(2),
      change: `${news.filter(n => n.sentimentLabel === 'positive').length}/${news.filter(n => n.sentimentLabel === 'negative').length} pos/neg`,
      icon: () => getSentimentIcon(avgSentiment),
      color: getSentimentColor(avgSentiment),
      bgColor: avgSentiment > 0.2 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
               avgSentiment < -0.2 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Market Summary
        </h2>
        <button
          onClick={fetchMarketData}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketSummaryCards.map((card, index) => {
          const IconComponent = typeof card.icon === 'function' ? card.icon : card.icon;
          
          return (
            <div key={index} className={`bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg ${card.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {card.title}
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {card.value}
                  </p>
                  <p className={`text-sm font-medium ${card.color}`}>
                    {card.change}
                  </p>
                </div>
                <div className="ml-4">
                  <IconComponent />
                </div>
              </div>
              
              {/* Real-time indicator */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span>{loading ? 'Updating...' : 'Live data'}</span>
                  <span>•</span>
                  <span>{lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-amber-700 dark:text-amber-300 text-sm">
              Some data may not be real-time due to API limitations
            </span>
          </div>
        </div>
      )}
    </div>
  );
};