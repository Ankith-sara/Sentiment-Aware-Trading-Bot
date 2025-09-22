import React from 'react';
import { Smile, Frown, Meh, Activity } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const SentimentOverview: React.FC = () => {
  const { news } = useTrading();

  const sentimentCounts = news.reduce(
    (acc, item) => {
      acc[item.sentimentLabel]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  const total = news.length;
  const positivePercent = (sentimentCounts.positive / total) * 100;
  const negativePercent = (sentimentCounts.negative / total) * 100;
  const neutralPercent = (sentimentCounts.neutral / total) * 100;

  const overallSentiment = news.reduce((sum, item) => sum + item.sentiment, 0) / total;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Sentiment Analysis
      </h2>

      <div className="space-y-6">
        <div className="text-center">
          <div className={`text-3xl font-bold ${
            overallSentiment > 0.2 ? 'text-emerald-600' :
            overallSentiment < -0.2 ? 'text-red-600' : 'text-amber-600'
          }`}>
            {overallSentiment.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overall Sentiment Score</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smile className="w-5 h-5 text-emerald-500" />
              <span className="text-gray-700 dark:text-gray-300">Positive</span>
            </div>
            <span className="font-semibold text-emerald-600">{sentimentCounts.positive}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${positivePercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Meh className="w-5 h-5 text-amber-500" />
              <span className="text-gray-700 dark:text-gray-300">Neutral</span>
            </div>
            <span className="font-semibold text-amber-600">{sentimentCounts.neutral}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${neutralPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Frown className="w-5 h-5 text-red-500" />
              <span className="text-gray-700 dark:text-gray-300">Negative</span>
            </div>
            <span className="font-semibold text-red-600">{sentimentCounts.negative}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${negativePercent}%` }}
            ></div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Activity className="w-4 h-4" />
            <span>Based on {total} recent news articles</span>
          </div>
        </div>
      </div>
    </div>
  );
};