import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockNews, mockPriceData, mockTrades, mockPortfolio } from '../data/mockData';
import { NewsItem, PriceData, TradeSignal, TradingConfig, Portfolio, ChatMessage, UserPreferences } from '../types/trading';

interface TradingContextType {
  // Data
  news: NewsItem[];
  priceData: PriceData[];
  trades: TradeSignal[];
  portfolio: Portfolio;
  chatMessages: ChatMessage[];
  userPreferences: UserPreferences;
  
  // Configuration
  config: TradingConfig;
  updateConfig: (config: Partial<TradingConfig>) => void;
  
  // Actions
  refreshData: () => void;
  addChatMessage: (message: ChatMessage) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  executeTrade: (signal: TradeSignal) => void;
  
  // State
  isLoading: boolean;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [priceData, setPriceData] = useState<PriceData[]>(mockPriceData);
  const [trades, setTrades] = useState<TradeSignal[]>(mockTrades);
  const [portfolio, setPortfolio] = useState<Portfolio>(mockPortfolio);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [watchlist, setWatchlist] = useState(['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']);
  
  const [config, setConfig] = useState<TradingConfig>({
    symbol: 'RELIANCE',
    buyThreshold: 0.2,
    sellThreshold: -0.2,
    newsApiKey: '',
    alpacaApiKey: '',
    alpacaSecret: '',
    riskTolerance: 'medium',
    maxPositionSize: 1000,
    enableNotifications: true,
    enablePaperTrading: true,
    stopLossPercent: 5,
    takeProfitPercent: 10,
    sentimentWeight: 0.6,
    technicalWeight: 0.4,
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteSymbols: ['RELIANCE', 'TCS'],
    ignoredSymbols: [],
    alertSettings: {
      email: true,
      push: true,
      telegram: false,
    },
    tradingStyle: 'moderate',
    timeHorizon: 'medium',
  });

  const updateConfig = (newConfig: Partial<TradingConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const updateUserPreferences = (newPreferences: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist(prev => [...prev, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  };

  const executeTrade = (signal: TradeSignal) => {
    // Simulate trade execution
    setTrades(prev => prev.map(trade => 
      trade.id === signal.id ? { ...trade, executed: true } : trade
    ));
    
    // Update portfolio (simplified simulation)
    if (signal.signal === 'BUY') {
      setPortfolio(prev => ({
        ...prev,
        cashBalance: prev.cashBalance - (signal.price * (signal.quantity || 10)),
        positions: [
          ...prev.positions.filter(p => p.symbol !== signal.symbol),
          {
            symbol: signal.symbol,
            quantity: (signal.quantity || 10),
            avgPrice: signal.price,
            currentPrice: signal.price,
            marketValue: signal.price * (signal.quantity || 10),
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
            dayChange: 0,
            dayChangePercent: 0,
          }
        ]
      }));
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would fetch fresh data from APIs
    setNews(prev => [...prev].sort(() => Math.random() - 0.5));
    setIsLoading(false);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update price data with small random changes
      setPriceData(prev => prev.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() - 0.5) * 0.02),
        sentiment: Math.max(-1, Math.min(1, item.sentiment + (Math.random() - 0.5) * 0.1))
      })));

      // Update portfolio positions with current prices
      setPortfolio(prev => ({
        ...prev,
        positions: prev.positions.map(position => {
          const newPrice = position.currentPrice * (1 + (Math.random() - 0.5) * 0.02);
          const unrealizedPnL = (newPrice - position.avgPrice) * position.quantity;
          return {
            ...position,
            currentPrice: newPrice,
            marketValue: newPrice * position.quantity,
            unrealizedPnL,
            unrealizedPnLPercent: (unrealizedPnL / (position.avgPrice * position.quantity)) * 100,
          };
        })
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TradingContext.Provider value={{
      news,
      priceData,
      trades,
      portfolio,
      chatMessages,
      userPreferences,
      config,
      updateConfig,
      refreshData,
      addChatMessage,
      updateUserPreferences,
      executeTrade,
      isLoading,
      selectedSymbol,
      setSelectedSymbol,
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
    }}>
      {children}
    </TradingContext.Provider>
  );
};