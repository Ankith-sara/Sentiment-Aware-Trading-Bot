// API service for communicating with Python FastAPI microservices

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async makeRequest<T>(baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    const token = this.getAuthToken();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Backend API calls
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return this.makeRequest(API_BASE_URL, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
    return this.makeRequest(API_BASE_URL, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    return this.makeRequest(API_BASE_URL, '/api/user/profile');
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<{ message: string }> {
    return this.makeRequest(API_BASE_URL, '/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getTradingHistory(): Promise<Trade[]> {
    return this.makeRequest(API_BASE_URL, '/api/trading/history');
  }

  async getUserConfig(): Promise<any> {
    return this.makeRequest(API_BASE_URL, '/api/user/config');
  }

  async updateUserConfig(config: any): Promise<{ message: string }> {
    return this.makeRequest(API_BASE_URL, '/api/user/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
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

  // News and Data Service
  async getLatestNews(symbols?: string[]): Promise<any[]> {
    const params = symbols ? `?symbols=${symbols.join(',')}` : '';
    return this.makeRequest(API_BASE_URL, `/api/news/latest${params}`);
  }

  async getNewsWithSentiment(symbols?: string[]): Promise<any[]> {
    const params = symbols ? `?symbols=${symbols.join(',')}` : '';
    return this.makeRequest(API_BASE_URL, `/api/news/sentiment${params}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    return this.makeRequest(API_BASE_URL, '/api/health');
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
}

export const apiService = new ApiService();

// Mock data for development when API is not available
export const mockApiService = {
  async analyzeSentiment(request: SentimentRequest): Promise<SentimentResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const score = Math.random();
    return {
      sentiment_score: score,
      confidence: 0.85 + Math.random() * 0.15,
      label: score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral',
      processing_time: 0.15 + Math.random() * 0.1
    };
  },

  async analyzeBatchSentiment(request: BatchSentimentRequest): Promise<BatchSentimentResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const results = request.texts.map(() => ({
      sentiment_score: Math.random(),
      confidence: 0.85 + Math.random() * 0.15,
      label: Math.random() > 0.5 ? 'positive' : 'negative' as 'positive' | 'negative',
      processing_time: 0.15 + Math.random() * 0.1
    }));

    return {
      results,
      total_processing_time: 0.8 + Math.random() * 0.4
    };
  },

  async getTradingSignals(symbols: string[]): Promise<TradingSignal[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return symbols.map(symbol => ({
      symbol,
      action: ['buy', 'sell', 'hold'][Math.floor(Math.random() * 3)] as 'buy' | 'sell' | 'hold',
      confidence: 0.7 + Math.random() * 0.3,
      sentiment_score: Math.random(),
      technical_score: Math.random(),
      combined_score: Math.random(),
      reasoning: `Based on sentiment analysis and technical indicators for ${symbol}`,
      timestamp: new Date().toISOString()
    }));
  }
};
  async getTradingHistory(): Promise<Trade[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        symbol: 'AAPL',
        type: 'buy',
        quantity: 100,
        price: 176.88,
        total: 17688.00,
        timestamp: new Date('2024-01-15T10:30:00').toISOString(),
        sentiment: 0.78,
        pnl: 234.40,
        status: 'completed'
      },
      {
        id: '2',
        symbol: 'NVDA',
        type: 'sell',
        quantity: 50,
        price: 718.45,
        total: 35922.50,
        timestamp: new Date('2024-01-15T09:45:00').toISOString(),
        sentiment: 0.82,
        pnl: 1245.80,
        status: 'completed'
      }
    ];
  },

  async getMarketData(request: MarketDataRequest): Promise<MarketDataResponse[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return request.symbols.map(symbol => ({
      symbol,
      price: 100 + Math.random() * 100,
      change: (Math.random() - 0.5) * 10,
      change_percent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      timestamp: new Date().toISOString()
    }));
  }