import aiohttp
import asyncio
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import os
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
import pandas as pd

logger = logging.getLogger(__name__)

class MarketDataManager:
    def __init__(self):
        self.alpaca_data_client = None
        self.is_connected = False
        self.session = None
        
        self._initialize()
    
    def _initialize(self):
        """Initialize market data connections"""
        try:
            # Initialize Alpaca data client
            api_key = os.getenv('ALPACA_API_KEY')
            secret_key = os.getenv('ALPACA_SECRET_KEY')
            
            if api_key and secret_key:
                self.alpaca_data_client = StockHistoricalDataClient(
                    api_key=api_key,
                    secret_key=secret_key
                )
                self.is_connected = True
                logger.info("Alpaca data client initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize market data manager: {e}")
    
    async def get_current_data(self, symbol: str) -> Optional[Dict]:
        """Get current market data for a symbol"""
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            # Use Finnhub for real-time quotes
            api_key = os.getenv('FINNHUB_API_KEY')
            url = f"https://finnhub.io/api/v1/quote"
            params = {
                'symbol': symbol,
                'token': api_key
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return {
                        'symbol': symbol,
                        'price': data.get('c', 0),  # Current price
                        'high': data.get('h', 0),   # High of the day
                        'low': data.get('l', 0),    # Low of the day
                        'open': data.get('o', 0),   # Open price
                        'previous_close': data.get('pc', 0),  # Previous close
                        'change': data.get('c', 0) - data.get('pc', 0),
                        'change_percent': ((data.get('c', 0) - data.get('pc', 0)) / data.get('pc', 1)) * 100,
                        'volume': 0,  # Finnhub quote doesn't include volume
                        'timestamp': datetime.now().isoformat()
                    }
                else:
                    logger.error(f"Failed to get current data for {symbol}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting current market data: {e}")
            return None
    
    async def get_historical_data(self, symbol: str, days: int = 30) -> List[Dict]:
        """Get historical market data"""
        try:
            if not self.alpaca_data_client:
                logger.error("Alpaca data client not initialized")
                return []
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Create request
            request_params = StockBarsRequest(
                symbol_or_symbols=[symbol],
                timeframe=TimeFrame.Day,
                start=start_date,
                end=end_date
            )
            
            # Get data
            bars = self.alpaca_data_client.get_stock_bars(request_params)
            
            # Convert to list of dictionaries
            historical_data = []
            for bar in bars[symbol]:
                historical_data.append({
                    'timestamp': bar.timestamp.isoformat(),
                    'open': float(bar.open),
                    'high': float(bar.high),
                    'low': float(bar.low),
                    'close': float(bar.close),
                    'volume': int(bar.volume)
                })
            
            return historical_data
            
        except Exception as e:
            logger.error(f"Error getting historical data: {e}")
            return []
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Dict]:
        """Get current quotes for multiple symbols"""
        results = {}
        
        # Use asyncio to get quotes concurrently
        tasks = [self.get_current_data(symbol) for symbol in symbols]
        quotes = await asyncio.gather(*tasks, return_exceptions=True)
        
        for symbol, quote in zip(symbols, quotes):
            if not isinstance(quote, Exception) and quote:
                results[symbol] = quote
        
        return results
    
    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()