// API service for communicating with Python FastAPI microservices

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
    return this.makeRequest(API_BASE_URL, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
    return this.makeRequest(API_BASE_URL, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    return this.makeRequest(API_BASE_URL, '/user/profile');
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<{ message: string }> {
    return this.makeRequest(API_BASE_URL, '/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getTradingHistory(): Promise<Trade[]> {
    return this.makeRequest(API_BASE_URL, '/trading/history');
  }

  async getUserConfig(): Promise<any> {
    return this.makeRequest(API_BASE_URL, '/user/config');
  }

  async updateUserConfig(config: any): Promise<{ message: string }> {
    return this.makeRequest(API_BASE_URL, '/user/config', {
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
    return this.makeRequest(API_BASE_URL, `/news/latest${params}`);
  }

  async getNewsWithSentiment(symbols?: string[]): Promise<any[]> {
    const params = symbols ? `?symbols=${symbols.join(',')}` : '';
    return this.makeRequest(API_BASE_URL, `/news/sentiment${params}`);
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
}

export const apiService = new ApiService();

// Fallback to mock data if API is unavailable
export const useMockData = false; // Set to true for development without backend