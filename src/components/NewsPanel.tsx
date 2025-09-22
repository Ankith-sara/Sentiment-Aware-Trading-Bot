import React, { useState, useMemo } from 'react';
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Filter, 
  Search,
  Calendar,
  BarChart3,
  PieChart,
  Newspaper
} from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const NewsPanel: React.FC = () => {
  const { news } = useTrading();
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'sentiment' | 'impact'>('date');

  const filteredAndSortedNews = useMemo(() => {
    let filtered = news.filter(item => {
      const matchesFilter = filter === 'all' || item.sentimentLabel === filter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'sentiment':
          return Math.abs(b.sentiment) - Math.abs(a.sentiment);
        case 'impact':
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        default:
          return 0;
      }
    });
  }, [news, filter, searchQuery, sortBy]);

  const sentimentStats = useMemo(() => {
    const total = news.length;
    const positive = news.filter(n => n.sentimentLabel === 'positive').length;
    const negative = news.filter(n => n.sentimentLabel === 'negative').length;
    const neutral = news.filter(n => n.sentimentLabel === 'neutral').length;
    const avgSentiment = news.reduce((sum, n) => sum + n.sentiment, 0) / total;

    return {
      total,
      positive,
      negative,
      neutral,
      avgSentiment,
      positivePercent: (positive / total) * 100,
      negativePercent: (negative / total) * 100,
      neutralPercent: (neutral / total) * 100,
    };
  }, [news]);

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (sentiment < -0.2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };

  const getSentimentBadge = (label: string, sentiment: number) => {
    const intensity = Math.abs(sentiment);
    const opacity = Math.min(1, 0.3 + intensity * 0.7);
    
    const colors = {
      positive: `bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300`,
      negative: `bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300`,
      neutral: `bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300`,
    };
    return colors[label as keyof typeof colors];
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      medium: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      low: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    return colors[impact as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Overview Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Distribution Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Market Sentiment Distribution
            </h2>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">{sentimentStats.positive}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Positive Articles</div>
              <div className="text-xs text-emerald-600 font-medium">
                {sentimentStats.positivePercent.toFixed(1)}%
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{sentimentStats.negative}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Negative Articles</div>
              <div className="text-xs text-red-600 font-medium">
                {sentimentStats.negativePercent.toFixed(1)}%
              </div>
            </div>

            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Minus className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">{sentimentStats.neutral}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Neutral Articles</div>
              <div className="text-xs text-amber-600 font-medium">
                {sentimentStats.neutralPercent.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Sentiment Trend Visualization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sentiment Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Positive Sentiment</span>
                <span className="text-sm font-medium text-emerald-600">{sentimentStats.positivePercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${sentimentStats.positivePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Negative Sentiment</span>
                <span className="text-sm font-medium text-red-600">{sentimentStats.negativePercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${sentimentStats.negativePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Neutral Sentiment</span>
                <span className="text-sm font-medium text-amber-600">{sentimentStats.neutralPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-amber-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${sentimentStats.neutralPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overall Sentiment Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overall Sentiment
            </h3>
            <PieChart className="w-5 h-5 text-purple-500" />
          </div>

          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${
              sentimentStats.avgSentiment > 0.2 ? 'text-emerald-600' :
              sentimentStats.avgSentiment < -0.2 ? 'text-red-600' : 'text-amber-600'
            }`}>
              {sentimentStats.avgSentiment.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Sentiment Score
            </div>

            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
              sentimentStats.avgSentiment > 0.2 ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' :
              sentimentStats.avgSentiment < -0.2 ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
              'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
            }`}>
              {getSentimentIcon(sentimentStats.avgSentiment)}
              <span>
                {sentimentStats.avgSentiment > 0.2 ? 'Bullish Market' :
                 sentimentStats.avgSentiment < -0.2 ? 'Bearish Market' : 'Neutral Market'}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Based on {sentimentStats.total} articles</p>
                <p>Updated every 5 minutes</p>
                <p>Powered by FinBERT AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                News & Sentiment Analysis
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              {/* Search */}
              <div className="relative w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="pl-10 pr-4 py-2 w-full lg:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full lg:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="all">All Sentiment</option>
                  <option value="positive">Positive Only</option>
                  <option value="negative">Negative Only</option>
                  <option value="neutral">Neutral Only</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full lg:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="sentiment">Sort by Sentiment</option>
                  <option value="impact">Sort by Impact</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* News Articles */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredAndSortedNews.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              filteredAndSortedNews.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        {getSentimentIcon(item.sentiment)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentBadge(item.sentimentLabel, item.sentiment)}`}>
                          {item.sentimentLabel}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactBadge(item.impact)}`}>
                          {item.impact} impact
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.source} • {new Date(item.publishedAt).toLocaleString()}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Score:</span>
                        <span className={`text-sm font-bold ${
                          item.sentiment > 0.2 ? 'text-emerald-600' :
                          item.sentiment < -0.2 ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {item.sentiment.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                      {item.title}
                    </h3>
                    
                    {/* Summary */}
                    {item.summary && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {item.summary}
                      </p>
                    )}
                    
                    {/* Keywords */}
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.keywords.slice(0, 5).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Analyzed by FinBERT</span>
                        <span>•</span>
                        <span>Confidence: {(Math.abs(item.sentiment) * 100).toFixed(0)}%</span>
                      </div>
                      
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                      >
                        <span>Read Full Article</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {filteredAndSortedNews.length > 0 && (
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200">
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};