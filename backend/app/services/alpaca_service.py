import alpaca_trade_api as tradeapi
from alpaca_trade_api.rest import APIError
import yfinance as yf
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
import asyncio
import aiohttp
from decimal import Decimal

from app.core.config import settings
from app.schemas.trading import TradeSignal, MarketData, Position

logger = logging.getLogger(__name__)

class AlpacaService:
    def __init__(self):
        self.api = None
        self.session: Optional[aiohttp.ClientSession] = None
        self.is_paper_trading = True
        self._initialize_api()
    
    def _initialize_api(self):
        """Initialize Alpaca API connection"""
        try:
            if settings.ALPACA_API_KEY and settings.ALPACA_SECRET_KEY:
                self.api = tradeapi.REST(
                    settings.ALPACA_API_KEY,
                    settings.ALPACA_SECRET_KEY,
                    settings.ALPACA_BASE_URL,
                    api_version='v2'
                )
                
                # Check if account is active
                account = self.api.get_account()
                self.is_paper_trading = account.trading_blocked or 'paper' in settings.ALPACA_BASE_URL
                
                logger.info(f"Alpaca API initialized - Paper Trading: {self.is_paper_trading}")
            else:
                logger.warning("Alpaca API keys not configured")
                
        except Exception as e:
            logger.error(f"Failed to initialize Alpaca API: {e}")
    
    async def get_session(self):
        """Get or create aiohttp session"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def get_market_data(
        self, 
        symbol: str, 
        timeframe: str = '1Day',
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[MarketData]:
        """Get historical market data"""
        try:
            if not self.api:
                # Fallback to yfinance for Indian stocks
                return await self._get_data_from_yfinance(symbol, timeframe, start_date, end_date, limit)
            
            # Convert Indian symbols to US equivalents if needed
            us_symbol = self._convert_to_us_symbol(symbol)
            
            # Set default date range
            if not start_date:
                start_date = datetime.now() - timedelta(days=365)
            if not end_date:
                end_date = datetime.now()
            
            # Get bars from Alpaca
            bars = self.api.get_bars(
                us_symbol,
                timeframe,
                start=start_date.isoformat(),
                end=end_date.isoformat(),
                limit=limit
            )
            
            market_data = []
            for bar in bars:
                data_point = MarketData(
                    symbol=symbol,
                    timestamp=bar.t,
                    open_price=float(bar.o),
                    high_price=float(bar.h),
                    low_price=float(bar.l),
                    close_price=float(bar.c),
                    volume=int(bar.v),
                    timeframe=timeframe
                )
                market_data.append(data_point)
            
            return market_data
            
        except Exception as e:
            logger.error(f"Failed to get market data from Alpaca: {e}")
            # Fallback to yfinance
            return await self._get_data_from_yfinance(symbol, timeframe, start_date, end_date, limit)
    
    async def _get_data_from_yfinance(
        self,
        symbol: str,
        timeframe: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[MarketData]:
        """Get market data from Yahoo Finance (fallback for Indian stocks)"""
        try:
            # Convert symbol to Yahoo Finance format for Indian stocks
            yf_symbol = self._convert_to_yf_symbol(symbol)
            
            # Convert timeframe
            period_map = {
                '1Min': '1m',
                '5Min': '5m',
                '15Min': '15m',
                '30Min': '30m',
                '1Hour': '1h',
                '1Day': '1d',
                '1Week': '1wk',
                '1Month': '1mo'
            }
            
            yf_interval = period_map.get(timeframe, '1d')
            
            # Set default period if no dates provided
            if not start_date and not end_date:
                period = '1y'
                data = yf.download(yf_symbol, period=period, interval=yf_interval, progress=False)
            else:
                start = start_date.strftime('%Y-%m-%d') if start_date else None
                end = end_date.strftime('%Y-%m-%d') if end_date else None
                data = yf.download(yf_symbol, start=start, end=end, interval=yf_interval, progress=False)
            
            if data.empty:
                return []
            
            market_data = []
            for index, row in data.iterrows():
                data_point = MarketData(
                    symbol=symbol,
                    timestamp=index.to_pydatetime() if hasattr(index, 'to_pydatetime') else index,
                    open_price=float(row['Open']),
                    high_price=float(row['High']),
                    low_price=float(row['Low']),
                    close_price=float(row['Close']),
                    volume=int(row['Volume']),
                    timeframe=timeframe
                )
                market_data.append(data_point)
            
            return market_data[-limit:] if limit else market_data
            
        except Exception as e:
            logger.error(f"Failed to get data from Yahoo Finance: {e}")
            return []
    
    async def get_current_price(self, symbol: str) -> Optional[float]:
        """Get current price for a symbol"""
        try:
            if not self.api:
                # Fallback to yfinance
                yf_symbol = self._convert_to_yf_symbol(symbol)
                ticker = yf.Ticker(yf_symbol)
                data = ticker.history(period='1d', interval='1m')
                if not data.empty:
                    return float(data['Close'].iloc[-1])
                return None
            
            us_symbol = self._convert_to_us_symbol(symbol)
            latest_trade = self.api.get_latest_trade(us_symbol)
            return float(latest_trade.price)
            
        except Exception as e:
            logger.error(f"Failed to get current price: {e}")
            return None
    
    async def execute_trade(self, signal: TradeSignal) -> Dict[str, Any]:
        """Execute a trade based on trading signal"""
        try:
            if not self.api:
                return {"success": False, "message": "Trading API not configured"}
            
            # Convert symbol if needed
            us_symbol = self._convert_to_us_symbol(signal.symbol)
            
            # Determine order side
            side = 'buy' if signal.signal == 'BUY' else 'sell'
            
            # Calculate quantity based on position size and current price
            current_price = await self.get_current_price(signal.symbol)
            if not current_price:
                return {"success": False, "message": "Could not get current price"}
            
            # Get account info for position sizing
            account = self.api.get_account()
            buying_power = float(account.buying_power)
            
            # Calculate max quantity based on risk management
            max_position_value = min(
                buying_power * 0.1,  # Max 10% of buying power per position
                settings.MAX_POSITION_SIZE
            )
            
            max_quantity = int(max_position_value / current_price)
            quantity = min(signal.quantity, max_quantity) if signal.quantity else max_quantity
            
            if quantity <= 0:
                return {"success": False, "message": "Insufficient buying power"}
            
            # Check for existing position
            positions = self.api.list_positions()
            existing_position = next((p for p in positions if p.symbol == us_symbol), None)
            
            # For sell signals, make sure we have the position
            if side == 'sell' and (not existing_position or int(existing_position.qty) < quantity):
                available_qty = int(existing_position.qty) if existing_position else 0
                if available_qty == 0:
                    return {"success": False, "message": "No position to sell"}
                quantity = min(quantity, available_qty)
            
            # Create order
            order = self.api.submit_order(
                symbol=us_symbol,
                qty=quantity,
                side=side,
                type='market',
                time_in_force='day'
            )
            
            logger.info(f"Order submitted: {order.id} - {side} {quantity} {us_symbol}")
            
            return {
                "success": True,
                "message": f"Order executed: {side.upper()} {quantity} shares of {signal.symbol}",
                "order_id": order.id,
                "quantity": quantity,
                "estimated_price": current_price
            }
            
        except APIError as e:
            logger.error(f"Alpaca API error during trade execution: {e}")
            return {"success": False, "message": f"Trading error: {str(e)}"}
        except Exception as e:
            logger.error(f"Trade execution failed: {e}")
            return {"success": False, "message": f"Execution failed: {str(e)}"}
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get current portfolio positions"""
        try:
            if not self.api:
                return []
            
            positions = self.api.list_positions()
            position_list = []
            
            for pos in positions:
                # Convert back to Indian symbol if applicable
                indian_symbol = self._convert_from_us_symbol(pos.symbol)
                
                position_data = {
                    "symbol": indian_symbol,
                    "quantity": int(pos.qty),
                    "avg_price": float(pos.avg_cost),
                    "current_price": float(pos.current_price),
                    "market_value": float(pos.market_value),
                    "unrealized_pnl": float(pos.unrealized_pl),
                    "unrealized_pnl_percent": float(pos.unrealized_plpc) * 100,
                    "day_change": float(pos.change_today),
                    "day_change_percent": float(pos.change_today) / float(pos.avg_cost) * 100
                }
                position_list.append(position_data)
            
            return position_list
            
        except Exception as e:
            logger.error(f"Failed to get positions: {e}")
            return []
    
    async def get_account_info(self) -> Dict[str, Any]:
        """Get account information"""
        try:
            if not self.api:
                return {"error": "API not configured"}
            
            account = self.api.get_account()
            
            return {
                "account_number": account.account_number,
                "buying_power": float(account.buying_power),
                "cash": float(account.cash),
                "portfolio_value": float(account.portfolio_value),
                "long_market_value": float(account.long_market_value),
                "short_market_value": float(account.short_market_value),
                "equity": float(account.equity),
                "last_equity": float(account.last_equity),
                "day_trade_buying_power": float(account.day_trade_buying_power),
                "daytrading_buying_power": float(account.daytrading_buying_power),
                "is_paper_trading": self.is_paper_trading
            }
            
        except Exception as e:
            logger.error(f"Failed to get account info: {e}")
            return {"error": str(e)}
    
    async def get_orders(self, status: str = 'all', limit: int = 50) -> List[Dict[str, Any]]:
        """Get orders"""
        try:
            if not self.api:
                return []
            
            orders = self.api.list_orders(status=status, limit=limit, nested=True)
            order_list = []
            
            for order in orders:
                indian_symbol = self._convert_from_us_symbol(order.symbol)
                
                order_data = {
                    "id": order.id,
                    "symbol": indian_symbol,
                    "qty": int(order.qty),
                    "side": order.side,
                    "order_type": order.type,
                    "time_in_force": order.time_in_force,
                    "status": order.status,
                    "created_at": order.created_at,
                    "filled_at": order.filled_at,
                    "filled_qty": int(order.filled_qty or 0),
                    "filled_avg_price": float(order.filled_avg_price or 0),
                    "limit_price": float(order.limit_price) if order.limit_price else None,
                    "stop_price": float(order.stop_price) if order.stop_price else None
                }
                order_list.append(order_data)
            
            return order_list
            
        except Exception as e:
            logger.error(f"Failed to get orders: {e}")
            return []
    
    def _convert_to_us_symbol(self, indian_symbol: str) -> str:
        """Convert Indian symbol to US equivalent (for ETFs or ADRs)"""
        # Mapping for Indian companies with US listings
        indian_to_us = {
            'INFY': 'INFY',      # Infosys ADR
            'WIT': 'WIT',        # Wipro ADR  
            'SIFY': 'SIFY',      # Sify ADR
            'RDY': 'RDY',        # Dr. Reddy's ADR
            'TTM': 'TTM',        # Tata Motors ADR
            'HDB': 'HDB',        # HDFC Bank ADR
            'IBN': 'IBN',        # ICICI Bank ADR
            'VEDL': 'VEDL',      # Vedanta ADR
            'AZRE': 'AZRE',      # Azure Power ADR
        }
        
        # For most Indian stocks, we'll need to use ETFs or indices
        # This is a simplified mapping - in reality, you'd use India ETFs
        if indian_symbol in indian_to_us:
            return indian_to_us[indian_symbol]
        
        # Fallback to Indian ETFs
        return 'INDA'  # iShares India ETF as fallback
    
    def _convert_from_us_symbol(self, us_symbol: str) -> str:
        """Convert US symbol back to Indian equivalent"""
        us_to_indian = {
            'INFY': 'INFY',
            'WIT': 'WIPRO', 
            'SIFY': 'SIFY',
            'RDY': 'DRREDDY',
            'TTM': 'TATAMOTORS',
            'HDB': 'HDFCBANK',
            'IBN': 'ICICIBANK',
            'VEDL': 'VEDL',
            'INDA': 'NIFTY',
        }
        
        return us_to_indian.get(us_symbol, us_symbol)
    
    def _convert_to_yf_symbol(self, indian_symbol: str) -> str:
        """Convert Indian symbol to Yahoo Finance format"""
        # Most Indian stocks on Yahoo Finance have .NS (NSE) or .BO (BSE) suffix
        if '.' not in indian_symbol:
            return f"{indian_symbol}.NS"  # Default to NSE
        return indian_symbol
    
    async def close(self):
        """Close connections"""
        if self.session:
            await self.session.close()

# Global Alpaca service instance
alpaca_service = AlpacaService()