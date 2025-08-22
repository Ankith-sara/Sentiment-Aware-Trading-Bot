// API service for communicating with Python FastAPI microservices
import { firebaseService, UserProfile, Trade, TradingSignal, SentimentScore, NewsItem } from './firebase';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SENTIMENT_SERVICE_URL = import.meta.env.VITE_SENTIMENT_SERVICE_URL || 'http://localhost:8001';
const TRADING_SERVICE_URL = import.meta.env.VITE_TRADING_SERVICE_URL || 'http://localhost:8002';
const SCHEDULER_SERVICE_URL = import.meta.env.VITE_SCHEDULER_SERVICE_URL || 'http://localhost:8003';

export interface SentimentRequest {
  text: string;
  source?: string;
}

export interface SentimentResponse {
  sentiment_score: number;
  confidence: number;
  label: 'positive' | 'negative' | 'neutral';
  processing_time: number;
}

export interface BatchSentimentRequest {
  texts: string[];
  sources?: string[];
}

export interface BatchSentimentResponse {
  results: SentimentResponse[];
  total_processing_time: number;
}

export interface TradingSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  sentiment_score: number;
  technical_score: number;
  combined_score: number;
  reasoning: string;
  timestamp: string;
}

export interface MarketDataRequest {
  symbols: string[];
  timeframe?: string;
}

export interface MarketDataResponse {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  tradingExperience: string;
  riskTolerance: 'low' | 'medium' | 'high';
  preferredAssets: string[];
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
  sentiment: number;
  pnl: number;
  status: 'completed' | 'pending' | 'cancelled';
}

class ApiService {
  private getCurrentUserId(): string | null {
    // This should be called from a component that has access to auth context
    return null; // Will be overridden by components
  }

  private async makeRequest<T>(baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Firebase-based methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return firebaseService.getUserProfile(userId);
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    return firebaseService.updateUserProfile(userId, profile);
  }

  async getTradingHistory(userId: string): Promise<Trade[]> {
    return firebaseService.getTrades(userId);
  }

  async getUserConfig(userId: string): Promise<any> {
    return firebaseService.getUserConfiguration(userId);
  }

  async updateUserConfig(userId: string, config: any): Promise<void> {
    return firebaseService.updateUserConfiguration(userId, config);
  }

  // Sentiment Analysis Service
  async analyzeSentiment(request: SentimentRequest): Promise<SentimentResponse> {
    return this.makeRequest<SentimentResponse>(SENTIMENT_SERVICE_URL, '/sentiment/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async analyzeBatchSentiment(request: BatchSentimentRequest): Promise<BatchSentimentResponse> {
    return this.makeRequest<BatchSentimentResponse>(SENTIMENT_SERVICE_URL, '/sentiment/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Trading Engine Service
  async getTradingSignals(symbols: string[]): Promise<TradingSignal[]> {
    return this.makeRequest<TradingSignal[]>(TRADING_SERVICE_URL, '/trading/signals', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
    });
  }

  async getMarketData(request: MarketDataRequest): Promise<MarketDataResponse[]> {
    return this.makeRequest<MarketDataResponse[]>(TRADING_SERVICE_URL, '/trading/market-data', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async executeTrade(signal: TradingSignal, quantity: number): Promise<any> {
    return this.makeRequest(TRADING_SERVICE_URL, '/trading/execute', {
      method: 'POST',
      body: JSON.stringify({ signal, quantity }),
    });
  }

  // Firebase-based news service
  async getLatestNews(symbols?: string[]): Promise<NewsItem[]> {
    return firebaseService.getNews(symbols);
  }

  async getNewsWithSentiment(symbols?: string[]): Promise<NewsItem[]> {
    return firebaseService.getNews(symbols);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    return this.makeRequest(API_BASE_URL, '/health');
  }

  // Scheduler Service
  async getScheduledJobs(): Promise<any> {
    return this.makeRequest(SCHEDULER_SERVICE_URL, '/jobs');
  }

  async runJobNow(jobId: string): Promise<any> {
    return this.makeRequest(SCHEDULER_SERVICE_URL, `/jobs/run/${jobId}`, {
      method: 'POST',
    });
  }

  // Firebase real-time subscriptions
  subscribeToTrades(userId: string, callback: (trades: Trade[]) => void): () => void {
    return firebaseService.subscribeToTrades(userId, callback);
  }

  subscribeToTradingSignals(userId: string, callback: (signals: TradingSignal[]) => void): () => void {
    return firebaseService.subscribeToTradingSignals(userId, callback);
  }

  // Store sentiment analysis results
  async storeSentimentScore(userId: string, sentimentData: Omit<SentimentScore, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> {
    return firebaseService.createSentimentScore({
      ...sentimentData,
      userId
    });
  }

  // Store trading signals
  async storeTradingSignal(userId: string, signalData: Omit<TradingSignal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> {
    return firebaseService.createTradingSignal({
      ...signalData,
      userId
    });
  }

  // Store trades
  async storeTrade(userId: string, tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> {
    return firebaseService.createTrade({
      ...tradeData,
      userId
    });
  }
}

export const apiService = new ApiService();