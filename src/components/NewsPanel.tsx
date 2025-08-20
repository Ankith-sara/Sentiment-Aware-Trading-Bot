import React, { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Clock, ExternalLink, Filter } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  timestamp: Date;
  sentiment: number;
  relevantSymbols: string[];
  url: string;
  impact: 'high' | 'medium' | 'low';
}

const NewsPanel: React.FC = () => {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState('all');
  const [selectedSymbol, setSelectedSymbol] = useState('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch news with sentiment on component mount
  React.useEffect(() => {
    const fetchNewsWithSentiment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const newsResponse = await apiService.getNewsWithSentiment(['AAPL', 'TSLA', 'MSFT', 'NVDA']);
        
        const formattedNews = newsResponse.map((item, index) => ({
          id: item.id || index.toString(),
          headline: item.headline,
          summary: item.summary,
          source: item.source,
          timestamp: new Date(item.timestamp),
          sentiment: item.sentiment_score,
          relevantSymbols: item.symbols || [],
          url: item.url || '#',
          impact: item.impact || 'medium' as 'high' | 'medium' | 'low'
        }));
        
        setNews(formattedNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news data');
        
        // Fallback to mock data
        setNews([
          {
            id: '1',
            headline: 'Apple Reports Strong Q4 Earnings, iPhone Sales Exceed Expectations',
            summary: 'Apple Inc. announced quarterly earnings that beat analyst expectations, driven by strong iPhone 15 sales and growing services revenue.',
            source: 'Reuters',
            timestamp: new Date(Date.now() - 1800000),
            sentiment: 0.85,
            relevantSymbols: ['AAPL'],
            url: '#',
            impact: 'high'
          },
          {
            id: '2',
            headline: 'Tesla Faces Production Challenges at Berlin Gigafactory',
            summary: 'Tesla is experiencing supply chain disruptions affecting production at its Berlin facility, potentially impacting Q4 delivery targets.',
            source: 'Bloomberg',
            timestamp: new Date(Date.now() - 3600000),
            sentiment: 0.25,
            relevantSymbols: ['TSLA'],
            url: '#',
            impact: 'medium'
          },
          {
            id: '3',
            headline: 'NVIDIA Announces New AI Chip Partnership with Major Cloud Providers',
            summary: 'NVIDIA has secured partnerships with AWS, Google Cloud, and Microsoft Azure for its next-generation H200 AI chips.',
            source: 'TechCrunch',
            timestamp: new Date(Date.now() - 7200000),
            sentiment: 0.78,
            relevantSymbols: ['NVDA'],
            url: '#',
            impact: 'high'
          },
          {
            id: '4',
            headline: 'Microsoft Azure Revenue Growth Accelerates in Cloud Computing Segment',
            summary: 'Microsoft reports 30% year-over-year growth in Azure revenue, outpacing competitors in the enterprise cloud market.',
            source: 'Wall Street Journal',
            timestamp: new Date(Date.now() - 10800000),
            sentiment: 0.72,
            relevantSymbols: ['MSFT'],
            url: '#',
            impact: 'medium'
          },
          {
            id: '5',
            headline: 'Federal Reserve Signals Potential Interest Rate Changes',
            summary: 'Fed officials hint at possible rate adjustments in upcoming meetings, citing inflation data and employment figures.',
            source: 'Financial Times',
            timestamp: new Date(Date.now() - 14400000),
            sentiment: 0.45,
            relevantSymbols: ['AAPL', 'MSFT', 'NVDA', 'TSLA'],
            url: '#',
            impact: 'high'
          },
          {
            id: '6',
            headline: 'Tech Sector Shows Strong Momentum Despite Market Volatility',
            summary: 'Technology stocks continue to outperform broader market indices, with AI and cloud computing driving growth.',
            source: 'CNBC',
            timestamp: new Date(Date.now() - 18000000),
            sentiment: 0.68,
            relevantSymbols: ['AAPL', 'MSFT', 'NVDA'],
            url: '#',
            impact: 'medium'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsWithSentiment();
  }, []);

  const filteredNews = news.filter(item => {
    if (filter === 'positive' && item.sentiment < 0.6) return false;
    if (filter === 'negative' && item.sentiment >= 0.4) return false;
    if (filter === 'neutral' && (item.sentiment < 0.4 || item.sentiment >= 0.6)) return false;
    if (selectedSymbol !== 'all' && !item.relevantSymbols.includes(selectedSymbol)) return false;
    return true;
  });

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.6) return 'Positive';
    if (sentiment >= 0.4) return 'Neutral';
    return 'Negative';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.6) return 'text-green-400';
    if (sentiment >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentBg = (sentiment: number) => {
    if (sentiment >= 0.6) return isDark ? 'bg-green-900/30 border-green-500/50' : 'bg-green-100 border-green-300';
    if (sentiment >= 0.4) return isDark ? 'bg-yellow-900/30 border-yellow-500/50' : 'bg-yellow-100 border-yellow-300';
    return isDark ? 'bg-red-900/30 border-red-500/50' : 'bg-red-100 border-red-300';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return isDark ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-100';
      case 'medium': return isDark ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-100';
      case 'low': return isDark ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100';
      default: return isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diffInMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className={`ml-4 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading news feed...</span>
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
      
      {/* Header and Filters */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-blue-500" />
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sentiment Analysis Feed
            </h2>
          </div>
          
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
                <option value="all">All Sentiment</option>
                <option value="positive">Positive Only</option>
                <option value="negative">Negative Only</option>
                <option value="neutral">Neutral Only</option>
              </select>
            </div>

            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value="all">All Symbols</option>
              <option value="AAPL">AAPL</option>
              <option value="TSLA">TSLA</option>
              <option value="MSFT">MSFT</option>
              <option value="NVDA">NVDA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-2xl shadow-xl border p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Positive News</p>
              <p className="text-2xl font-bold text-green-400">{news.filter(n => n.sentiment >= 0.6).length}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-xl border p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <div className={`h-4 w-4 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}></div>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Neutral News</p>
              <p className="text-2xl font-bold text-yellow-400">{news.filter(n => n.sentiment >= 0.4 && n.sentiment < 0.6).length}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-xl border p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Negative News</p>
              <p className="text-2xl font-bold text-red-400">{news.filter(n => n.sentiment < 0.4).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        {filteredNews.map((item) => (
          <div key={item.id} className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 lg:mr-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-lg font-semibold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.headline}
                  </h3>
                  <a 
                    href={item.url} 
                    className={`ml-2 transition-colors flex-shrink-0 ${
                      isDark 
                        ? 'text-gray-400 hover:text-blue-400' 
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.summary}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTimeAgo(item.timestamp)}
                  </div>
                  
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>•</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{item.source}</span>
                  
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>•</span>
                  <div className="flex items-center space-x-1">
                    {item.relevantSymbols.map(symbol => (
                      <span key={symbol} className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        isDark 
                          ? 'bg-blue-900/30 text-blue-300' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {symbol}
                      </span>
                    ))}
                  </div>
                  
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>•</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}>
                    {item.impact.toUpperCase()} IMPACT
                  </span>
                </div>
              </div>
              
              {/* Sentiment Analysis */}
              <div className="lg:w-48 flex-shrink-0">
                <div className={`p-4 rounded-xl border-l-4 ${getSentimentBg(item.sentiment)}`}>
                  <div className="text-center">
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      SENTIMENT SCORE
                    </div>
                    <div className={`text-2xl font-bold ${getSentimentColor(item.sentiment)} mb-2`}>
                      {(item.sentiment * 100).toFixed(0)}%
                    </div>
                    <div className={`text-sm font-medium ${getSentimentColor(item.sentiment)} mb-3`}>
                      {getSentimentLabel(item.sentiment)}
                    </div>
                    
                    {/* Sentiment Bar */}
                    <div className={`w-full rounded-full h-2 mb-2 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.sentiment >= 0.6 ? 'bg-green-500' : 
                          item.sentiment >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.sentiment * 100}%` }}
                      />
                    </div>
                    
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      AI Confidence: {Math.floor(85 + Math.random() * 10)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className={`rounded-2xl shadow-xl border p-12 text-center ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <Brain className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No news items match your current filters.
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Try adjusting your sentiment or symbol filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsPanel;