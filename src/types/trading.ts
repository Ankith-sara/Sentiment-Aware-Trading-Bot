export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  sentiment: number; // -1 to 1
  sentimentLabel: 'positive' | 'negative' | 'neutral';
  url: string;
  summary?: string;
  impact: 'high' | 'medium' | 'low';
  keywords: string[];
}

export interface PriceData {
  timestamp: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sentiment: number;
  change: number;
  changePercent: number;
  technicalIndicators: {
    rsi: number;
    macd: number;
    sma20: number;
    sma50: number;
    bollinger: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
}

export interface TradeSignal {
  id: string;
  timestamp: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  confidence: number;
  reason: string;
  sentimentScore: number;
  technicalScore: number;
  combinedScore: number;
  executed: boolean;
  quantity?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TradingConfig {
  symbol: string;
  buyThreshold: number;
  sellThreshold: number;
  newsApiKey: string;
  alpacaApiKey: string;
  alpacaSecret: string;
  geminiApiKey?: string;
  grokApiKey?: string;
  riskTolerance: 'low' | 'medium' | 'high';
  maxPositionSize: number;
  enableNotifications: boolean;
  enablePaperTrading: boolean;
  stopLossPercent: number;
  takeProfitPercent: number;
  sentimentWeight: number;
  technicalWeight: number;
}

export interface Portfolio {
  id: string;
  totalValue: number;
  cashBalance: number;
  positions: Position[];
  dailyPnL: number;
  totalPnL: number;
  performance: PerformanceMetrics;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    symbol?: string;
    signal?: TradeSignal;
    news?: NewsItem[];
  };
}

export interface UserPreferences {
  favoriteSymbols: string[];
  ignoredSymbols: string[];
  alertSettings: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
  tradingStyle: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
}

export interface BacktestResult {
  id: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: TradeSignal[];
  equity: { date: string; value: number }[];
}