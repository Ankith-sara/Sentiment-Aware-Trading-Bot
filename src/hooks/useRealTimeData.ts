import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { PriceData, NewsItem, TradeSignal } from '../types/trading';

interface UseRealTimeDataProps {
  symbol: string;
  enabled: boolean;
  refreshInterval?: number;
}

export const useRealTimeData = ({ 
  symbol, 
  enabled, 
  refreshInterval = 5000 
}: UseRealTimeDataProps) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [marketData, newsData, signalData] = await Promise.all([
        apiService.getMarketData(symbol),
        apiService.getNews(symbol),
        apiService.getTradeSignals(symbol),
      ]);

      setPriceData(marketData);
      setNews(newsData);
      setSignals(signalData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Real-time data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time updates
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, enabled, refreshInterval]);

  // WebSocket connection for real-time updates (when available)
  useEffect(() => {
    if (!enabled || !symbol) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/${symbol}`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected for ${symbol}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'price_update':
              setPriceData(prev => [...prev.slice(-99), data.payload]);
              break;
            case 'news_update':
              setNews(prev => [data.payload, ...prev.slice(0, 19)]);
              break;
            case 'signal_update':
              setSignals(prev => [data.payload, ...prev.slice(0, 9)]);
              break;
          }
          
          setLastUpdate(new Date());
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Real-time connection lost');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (err) {
      console.warn('WebSocket not available, using polling fallback');
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [symbol, enabled]);

  return {
    priceData,
    news,
    signals,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
};