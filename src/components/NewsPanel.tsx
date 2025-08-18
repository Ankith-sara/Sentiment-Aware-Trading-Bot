import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Clock, ExternalLink, Filter } from 'lucide-react';

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
  const [filter, setFilter] = useState('all');
  const [selectedSymbol, setSelectedSymbol] = useState('all');
  
  const [news] = useState<NewsItem[]>([
    {
      id: '1',
      headline: 'Apple Reports Strong Q4 Earnings, iPhone Sales Exceed Expectations',
      summary: 'Apple Inc. announced quarterly earnings that beat analyst expectations, driven by strong iPhone 15 sales and growing services revenue.',
      source: 'Reuters',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
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
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
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
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
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
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
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
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
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
      timestamp: new Date(Date.now() - 18000000), // 5 hours ago
      sentiment: 0.68,
      relevantSymbols: ['AAPL', 'MSFT', 'NVDA'],
      url: '#',
      impact: 'medium'
    }
  ]);

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
    if (sentiment >= 0.6) return 'bg-green-900 border-green-500';
    if (sentiment >= 0.4) return 'bg-yellow-900 border-yellow-500';
    return 'bg-red-900 border-red-500';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-900';
      case 'medium': return 'text-yellow-400 bg-yellow-900';
      case 'low': return 'text-green-400 bg-green-900';
      default: return 'text-slate-400 bg-slate-700';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diffInMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Sentiment Analysis Feed</h2>
          </div>
          
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
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
              className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
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
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-slate-400 text-sm">Positive News</p>
              <p className="text-2xl font-bold text-green-400">{news.filter(n => n.sentiment >= 0.6).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-slate-800 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Neutral News</p>
              <p className="text-2xl font-bold text-yellow-400">{news.filter(n => n.sentiment >= 0.4 && n.sentiment < 0.6).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-slate-400 text-sm">Negative News</p>
              <p className="text-2xl font-bold text-red-400">{news.filter(n => n.sentiment < 0.4).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        {filteredNews.map((item) => (
          <div key={item.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 lg:mr-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white leading-tight">{item.headline}</h3>
                  <a 
                    href={item.url} 
                    className="ml-2 text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <p className="text-slate-300 mb-4 leading-relaxed">{item.summary}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center text-slate-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTimeAgo(item.timestamp)}
                  </div>
                  
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">{item.source}</span>
                  
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center space-x-1">
                    {item.relevantSymbols.map(symbol => (
                      <span key={symbol} className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs font-medium">
                        {symbol}
                      </span>
                    ))}
                  </div>
                  
                  <span className="text-slate-400">•</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}>
                    {item.impact.toUpperCase()} IMPACT
                  </span>
                </div>
              </div>
              
              {/* Sentiment Analysis */}
              <div className="lg:w-48 flex-shrink-0">
                <div className={`p-4 rounded-lg border-l-4 ${getSentimentBg(item.sentiment)}`}>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">SENTIMENT SCORE</div>
                    <div className={`text-2xl font-bold ${getSentimentColor(item.sentiment)} mb-2`}>
                      {(item.sentiment * 100).toFixed(0)}%
                    </div>
                    <div className={`text-sm font-medium ${getSentimentColor(item.sentiment)} mb-3`}>
                      {getSentimentLabel(item.sentiment)}
                    </div>
                    
                    {/* Sentiment Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.sentiment >= 0.6 ? 'bg-green-500' : 
                          item.sentiment >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.sentiment * 100}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-slate-500">
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
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <Brain className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No news items match your current filters.</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your sentiment or symbol filters.</p>
        </div>
      )}
    </div>
  );
};

export default NewsPanel;