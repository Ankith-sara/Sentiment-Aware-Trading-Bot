import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const MarketSummary: React.FC = () => {
  const { priceData, selectedSymbol, news } = useTrading();
  
  const latestData = priceData[priceData.length - 1];
  const previousData = priceData[priceData.length - 2];
  
  if (!latestData || !previousData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  const priceChange = latestData.price - previousData.price;
  const changePercent = (priceChange / previousData.price) * 100;
  const sentiment = latestData.sentiment;
  const avgSentiment = news.reduce((sum, item) => sum + item.sentiment, 0) / news.length;

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

  const marketSummaryCards = [
    {
      title: `${selectedSymbol} Price`,
      value: `₹${latestData.price.toFixed(2)}`,
      change: `${priceChange >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
      icon: priceChange >= 0 ? TrendingUp : TrendingDown,
      color: priceChange >= 0 ? 'text-emerald-600' : 'text-red-600',
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
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Live data</span>
                <span>•</span>
                <span>{new Date(latestData.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};