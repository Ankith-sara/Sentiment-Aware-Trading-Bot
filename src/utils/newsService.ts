/**
 * News service for fetching and processing financial news
 * In production, this would integrate with NewsAPI, Alpaca News, or similar services
 */

import { NewsItem } from '../types/trading';
import { analyzeSentiment } from './sentimentAnalysis';

export const fetchNews = async (symbol: string, apiKey: string): Promise<NewsItem[]> => {
  // Mock implementation - in production, integrate with real news APIs
  const mockHeadlines = [
    `${symbol} Reports Strong Quarterly Earnings, Beats Street Expectations`,
    `${symbol} Faces SEBI Scrutiny Over New Business Practices`,
    `Domestic Analysts Upgrade ${symbol} Rating Following Strategic Partnership`,
    `${symbol} Stock Experiences Volatility Amid RBI Policy Uncertainty`,
    `${symbol} Announces Major Investment in Green Energy Technologies`,
    `FII and DII Increase ${symbol} Holdings in Latest Filing`,
    `${symbol} Management Discusses Future Growth Strategy in Investor Call`,
    `Supply Chain Challenges Impact ${symbol} Production Forecasts in India`,
  ];

  const news: NewsItem[] = mockHeadlines.map((title, index) => {
    const sentiment = analyzeSentiment(title);
    const publishedAt = new Date(Date.now() - index * 2 * 60 * 60 * 1000); // 2 hours apart

    return {
      id: `news-${index}`,
      title,
      source: ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Financial Times'][index % 5],
      source: ['Economic Times', 'Moneycontrol', 'Business Standard', 'Mint', 'Hindu BusinessLine'][index % 5],
      publishedAt: publishedAt.toISOString(),
      sentiment: sentiment.score,
      sentimentLabel: sentiment.label,
      url: '#',
      summary: `Detailed analysis of ${title.toLowerCase()} and its potential market implications.`
    };
  });

  return news;
};

export const processNewsForTrading = (news: NewsItem[]): {
  overallSentiment: number;
  trendingTopics: string[];
  sentimentDistribution: { positive: number; negative: number; neutral: number };
} => {
  const overallSentiment = news.reduce((sum, item) => sum + item.sentiment, 0) / news.length;
  
  const sentimentDistribution = news.reduce(
    (acc, item) => {
      acc[item.sentimentLabel]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  // Extract trending topics from headlines
  const trendingTopics = ['Earnings', 'Partnership', 'Investment', 'Volatility', 'Growth'];

  return {
    overallSentiment,
    trendingTopics,
    sentimentDistribution
  };
};