/**
 * API Service for real-time data integration
 * Handles communication with FastAPI backend
 */

import { NewsItem, PriceData, TradeSignal, Portfolio } from '../types/trading';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Authentication
  async authenticate(token: string) {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  // Market Data
  async getMarketData(symbol: string, timeframe: string = '1D'): Promise<PriceData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/market-data/${symbol}?timeframe=${timeframe}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // News and Sentiment
  async getNews(symbol: string, limit: number = 20): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/news/${symbol}?limit=${limit}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<{ score: number; label: string; confidence: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sentiment/analyze`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze sentiment: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  // Trading Signals
  async getTradeSignals(symbol: string): Promise<TradeSignal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signals/${symbol}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trade signals: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching trade signals:', error);
      throw error;
    }
  }

  async generateSignal(symbol: string, config: any): Promise<TradeSignal> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signals/generate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ symbol, config }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate signal: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating signal:', error);
      throw error;
    }
  }

  // Portfolio Management
  async getPortfolio(): Promise<Portfolio> {
    try {
      const response = await fetch(`${this.baseUrl}/api/portfolio`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  }

  async executeTrade(signal: TradeSignal): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/portfolio/execute-trade`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(signal),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute trade: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing trade:', error);
      throw error;
    }
  }

  // AI Chatbot
  async sendChatMessage(message: string, context?: any): Promise<{ response: string; context?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ message, context }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send chat message: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Technical Analysis
  async getTechnicalIndicators(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/technical/${symbol}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch technical indicators: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching technical indicators:', error);
      throw error;
    }
  }

  // Backtesting
  async runBacktest(config: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/backtest`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to run backtest: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error running backtest:', error);
      throw error;
    }
  }

  // User Preferences
  async updateUserPreferences(preferences: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user/preferences`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();