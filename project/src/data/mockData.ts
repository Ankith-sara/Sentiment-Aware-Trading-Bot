import { NewsItem, PriceData, TradeSignal, Portfolio } from '../types/trading';

// Generate candlestick data for more realistic trading visualization
export const generateCandlestickData = (basePriceINR: number, count: number) => {
  const data = [];
  let currentPrice = basePriceINR;
  
  for (let i = 0; i < count; i++) {
    const open = currentPrice;
    const volatility = 0.02 + Math.random() * 0.03; // 2-5% volatility
    const direction = Math.random() > 0.5 ? 1 : -1;
    const change = direction * volatility * Math.random();
    
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    data.push({
      timestamp: new Date(Date.now() - (count - i) * 5 * 60 * 1000).toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      sentiment: (Math.sin(i * 0.1) + Math.random() - 0.5) * 0.5,
    });
    
    currentPrice = close;
  }
  
  return data;
};

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Reliance Industries Reports Strong Q3 Results, Revenue Grows 12% YoY',
    source: 'Economic Times',
    publishedAt: '2025-01-02T10:30:00Z',
    sentiment: 0.8,
    sentimentLabel: 'positive',
    url: '#',
    summary: 'Reliance Industries Ltd reported quarterly earnings that exceeded analyst expectations, driven by strong petrochemicals and digital services growth.',
    impact: 'high',
    keywords: ['earnings', 'revenue', 'petrochemicals', 'digital services']
  },
  {
    id: '2',
    title: 'Market Volatility Concerns Grow Amid RBI Policy Uncertainty',
    source: 'Moneycontrol',
    publishedAt: '2025-01-02T09:15:00Z',
    sentiment: -0.6,
    sentimentLabel: 'negative',
    url: '#',
    summary: 'Investors express concerns about market stability as RBI signals potential policy changes affecting interest rates.',
    impact: 'high',
    keywords: ['volatility', 'RBI', 'policy', 'interest rates']
  },
  {
    id: '3',
    title: 'IT Sector Shows Mixed Performance in Pre-Market Trading Session',
    source: 'Business Standard',
    publishedAt: '2025-01-02T08:45:00Z',
    sentiment: 0.1,
    sentimentLabel: 'neutral',
    url: '#',
    summary: 'IT stocks display varied performance patterns ahead of market open, with TCS gaining while Infosys declines.',
    impact: 'medium',
    keywords: ['IT sector', 'pre-market', 'trading', 'TCS', 'Infosys']
  },
  {
    id: '4',
    title: 'TCS Announces Major AI Partnership with Microsoft, Stock Surges 6%',
    source: 'Mint',
    publishedAt: '2025-01-02T16:20:00Z',
    sentiment: 0.9,
    sentimentLabel: 'positive',
    url: '#',
    summary: 'TCS strategic AI partnership announcement drives significant after-hours trading volume and investor enthusiasm.',
    impact: 'high',
    keywords: ['AI', 'partnership', 'Microsoft', 'innovation', 'TCS']
  },
  {
    id: '5',
    title: 'SEBI Regulations Impact IT Sector Valuations Across the Board',
    source: 'Hindu BusinessLine',
    publishedAt: '2025-01-02T11:10:00Z',
    sentiment: -0.4,
    sentimentLabel: 'negative',
    url: '#',
    summary: 'New SEBI regulatory proposals create uncertainty in the IT sector, affecting major tech stock valuations.',
    impact: 'medium',
    keywords: ['SEBI', 'regulation', 'IT', 'valuations', 'uncertainty']
  }
];

export const mockPriceData: PriceData[] = generateCandlestickData(3500, 100).map((candle, i, arr) => {
  const prevCandle = i > 0 ? arr[i - 1] : candle;
  const change = candle.close - prevCandle.close;
  const changePercent = (change / prevCandle.close) * 100;
  
  return {
    timestamp: candle.timestamp,
    price: candle.close,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
    sentiment: Math.max(-1, Math.min(1, candle.sentiment)),
    change,
    changePercent,
    technicalIndicators: {
      rsi: 30 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 2,
      sma20: candle.close * (0.98 + Math.random() * 0.04),
      sma50: candle.close * (0.95 + Math.random() * 0.1),
      bollinger: {
        upper: candle.close * 1.02,
        middle: candle.close,
        lower: candle.close * 0.98,
      }
    }
  };
});

export const mockTrades: TradeSignal[] = [
  {
    id: '1',
    timestamp: '2025-01-02T10:30:00Z',
    symbol: 'RELIANCE',
    signal: 'BUY',
    price: 3520.50,
    confidence: 0.85,
    reason: 'Strong positive sentiment (0.75) from earnings news + RSI oversold condition',
    sentimentScore: 0.75,
    technicalScore: 0.65,
    combinedScore: 0.71,
    executed: true,
    quantity: 100,
    stopLoss: 3344.48,
    takeProfit: 3872.55,
    riskLevel: 'medium',
  },
  {
    id: '2',
    timestamp: '2025-01-02T09:15:00Z',
    symbol: 'RELIANCE',
    signal: 'HOLD',
    price: 3515.20,
    confidence: 0.65,
    reason: 'Mixed sentiment signals, technical indicators neutral, awaiting clearer direction',
    sentimentScore: 0.05,
    technicalScore: 0.45,
    combinedScore: 0.22,
    executed: false,
    riskLevel: 'low',
  },
  {
    id: '3',
    timestamp: '2025-01-02T08:45:00Z',
    symbol: 'RELIANCE',
    signal: 'SELL',
    price: 3498.75,
    confidence: 0.72,
    reason: 'Negative sentiment trend (-0.45) from regulatory concerns + MACD bearish crossover',
    sentimentScore: -0.45,
    technicalScore: -0.35,
    combinedScore: -0.41,
    executed: true,
    quantity: 50,
    riskLevel: 'medium',
  },
];

export const mockPortfolio: Portfolio = {
  id: 'portfolio-1',
  totalValue: 2150000.00,
  cashBalance: 480000.00,
  dailyPnL: 27125.50,
  totalPnL: 146000.00,
  positions: [
    {
      symbol: 'RELIANCE',
      quantity: 100,
      avgPrice: 3485.50,
      currentPrice: 3520.30,
      marketValue: 352030.00,
      unrealizedPnL: 3480.00,
      unrealizedPnLPercent: 2.56,
      dayChange: 65.80,
      dayChangePercent: 1.87,
    },
    {
      symbol: 'TCS',
      quantity: 25,
      avgPrice: 4125.20,
      currentPrice: 4210.80,
      marketValue: 105270.00,
      unrealizedPnL: 2140.00,
      unrealizedPnLPercent: 2.05,
      dayChange: -28.20,
      dayChangePercent: -0.67,
    },
    {
      symbol: 'INFY',
      quantity: 15,
      avgPrice: 1850.00,
      currentPrice: 1842.35,
      marketValue: 27635.25,
      unrealizedPnL: -114.75,
      unrealizedPnLPercent: -0.42,
      dayChange: 19.85,
      dayChangePercent: 1.09,
    }
  ],
  performance: {
    totalReturn: 146000.00,
    totalReturnPercent: 7.29,
    sharpeRatio: 1.45,
    maxDrawdown: -3.2,
    winRate: 68.5,
    avgWin: 20442.50,
    avgLoss: -13067.20,
    profitFactor: 1.85,
  }
};