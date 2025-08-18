// API service for communicating with Python FastAPI microservices

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:8000';

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

class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
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

  // Sentiment Analysis Service
  async analyzeSentiment(request: SentimentRequest): Promise<SentimentResponse> {
    return this.makeRequest<SentimentResponse>('/sentiment/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async analyzeBatchSentiment(request: BatchSentimentRequest): Promise<BatchSentimentResponse> {
    return this.makeRequest<BatchSentimentResponse>('/sentiment/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Trading Engine Service
  async getTradingSignals(symbols: string[]): Promise<TradingSignal[]> {
    return this.makeRequest<TradingSignal[]>('/trading/signals', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
    });
  }

  async getMarketData(request: MarketDataRequest): Promise<MarketDataResponse[]> {
    return this.makeRequest<MarketDataResponse[]>('/trading/market-data', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async executeTrade(signal: TradingSignal, quantity: number): Promise<any> {
    return this.makeRequest('/trading/execute', {
      method: 'POST',
      body: JSON.stringify({ signal, quantity }),
    });
  }

  // News and Data Service
  async getLatestNews(symbols?: string[]): Promise<any[]> {
    const params = symbols ? `?symbols=${symbols.join(',')}` : '';
    return this.makeRequest(`/news/latest${params}`);
  }

  async getNewsWithSentiment(symbols?: string[]): Promise<any[]> {
    const params = symbols ? `?symbols=${symbols.join(',')}` : '';
    return this.makeRequest(`/news/sentiment${params}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    return this.makeRequest('/health');
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