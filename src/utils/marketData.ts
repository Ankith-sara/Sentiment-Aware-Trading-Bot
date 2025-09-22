/**
 * Market data utilities for fetching and processing stock information
 * In production, this would integrate with Alpaca Markets or Yahoo Finance APIs
 */

import { PriceData } from '../types/trading';

export const fetchMarketData = async (symbol: string): Promise<PriceData[]> => {
  // Mock implementation - in production, integrate with real market data APIs
  const basePrice = 150;
  const data: PriceData[] = [];
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(Date.now() - (99 - i) * 5 * 60 * 1000);
    const price = basePrice + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 5;
    const previousPrice = i > 0 ? data[i - 1].price : price;
    const change = price - previousPrice;
    
    data.push({
      timestamp: timestamp.toISOString(),
      price,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      sentiment: (Math.sin(i * 0.1) + Math.random() - 0.5) * 0.5,
      change,
      changePercent: (change / previousPrice) * 100,
    });
  }
  
  return data;
};

export const calculateTechnicalIndicators = (priceData: PriceData[]) => {
  // Calculate moving averages and other technical indicators
  const prices = priceData.map(d => d.price);
  
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const rsi = calculateRSI(prices, 14);
  
  return { sma20, sma50, rsi };
};

const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1];
  
  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((sum, price) => sum + price, 0) / period;
};

const calculateRSI = (prices: number[], period: number): number => {
  if (prices.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(change => change > 0);
  const losses = recentChanges.filter(change => change < 0).map(loss => Math.abs(loss));
  
  const avgGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / gains.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};