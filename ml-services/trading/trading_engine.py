import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import os
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.common.exceptions import APIError
import pandas as pd
import redis.asyncio as redis
import json

logger = logging.getLogger(__name__)

class TradingEngine:
    def __init__(self):
        self.alpaca_client = None
        self.is_initialized = False
        self.alpaca_connected = False
        self.redis_client = None
        
        self._initialize()
    
    def _initialize(self):
        """Initialize the trading engine"""
        try:
            # Initialize Alpaca client
            api_key = os.getenv('ALPACA_API_KEY')
            secret_key = os.getenv('ALPACA_SECRET_KEY')
            base_url = os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')
            
            if api_key and secret_key:
                self.alpaca_client = TradingClient(
                    api_key=api_key,
                    secret_key=secret_key,
                    paper=True  # Use paper trading by default
                )
                self.alpaca_connected = True
                logger.info("Alpaca client initialized")
            
            # Initialize Redis connection
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            
            self.is_initialized = True
            logger.info("Trading engine initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize trading engine: {e}")
    
    async def execute_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str = "market",
        limit_price: Optional[float] = None,
        user_id: int = None
    ) -> Dict:
        """Execute a trading order"""
        if not self.alpaca_connected:
            raise Exception("Alpaca client not connected")
        
        try:
            # Convert side to Alpaca enum
            order_side = OrderSide.BUY if side.lower() == 'buy' else OrderSide.SELL
            
            # Create order request
            if order_type.lower() == "market":
                order_request = MarketOrderRequest(
                    symbol=symbol,
                    qty=quantity,
                    side=order_side,
                    time_in_force=TimeInForce.DAY
                )
            else:  # limit order
                if not limit_price:
                    raise ValueError("Limit price required for limit orders")
                
                order_request = LimitOrderRequest(
                    symbol=symbol,
                    qty=quantity,
                    side=order_side,
                    time_in_force=TimeInForce.DAY,
                    limit_price=limit_price
                )
            
            # Submit order
            order = self.alpaca_client.submit_order(order_data=order_request)
            
            # Return order information
            return {
                'order_id': str(order.id),
                'symbol': order.symbol,
                'side': order.side.value,
                'quantity': float(order.qty),
                'status': order.status.value,
                'order_type': order.order_type.value,
                'submitted_at': order.submitted_at.isoformat() if order.submitted_at else None,
                'filled_price': float(order.filled_avg_price) if order.filled_avg_price else None,
                'filled_qty': float(order.filled_qty) if order.filled_qty else 0
            }
            
        except APIError as e:
            logger.error(f"Alpaca API error: {e}")
            raise Exception(f"Order execution failed: {e}")
        except Exception as e:
            logger.error(f"Order execution error: {e}")
            raise
    
    async def get_portfolio(self, user_id: int) -> Dict:
        """Get portfolio information for a user"""
        if not self.alpaca_connected:
            raise Exception("Alpaca client not connected")
        
        try:
            # Get account information
            account = self.alpaca_client.get_account()
            
            # Get positions
            positions = self.alpaca_client.get_all_positions()
            
            # Get orders
            orders = self.alpaca_client.get_orders()
            
            # Format response
            portfolio_data = {
                'account': {
                    'equity': float(account.equity),
                    'cash': float(account.cash),
                    'buying_power': float(account.buying_power),
                    'portfolio_value': float(account.portfolio_value),
                    'day_trade_count': account.day_trade_count,
                    'pattern_day_trader': account.pattern_day_trader
                },
                'positions': [
                    {
                        'symbol': pos.symbol,
                        'quantity': float(pos.qty),
                        'market_value': float(pos.market_value),
                        'cost_basis': float(pos.cost_basis),
                        'unrealized_pl': float(pos.unrealized_pl),
                        'unrealized_plpc': float(pos.unrealized_plpc),
                        'current_price': float(pos.current_price) if pos.current_price else None,
                        'side': pos.side.value
                    }
                    for pos in positions
                ],
                'orders': [
                    {
                        'id': str(order.id),
                        'symbol': order.symbol,
                        'side': order.side.value,
                        'quantity': float(order.qty),
                        'status': order.status.value,
                        'order_type': order.order_type.value,
                        'submitted_at': order.submitted_at.isoformat() if order.submitted_at else None
                    }
                    for order in orders[:10]  # Last 10 orders
                ],
                'timestamp': datetime.now().isoformat()
            }
            
            return portfolio_data
            
        except Exception as e:
            logger.error(f"Error getting portfolio: {e}")
            raise
    
    async def log_trade(self, order_result: dict, user_id: int):
        """Log trade execution to database"""
        try:
            # In a real implementation, this would save to PostgreSQL
            # For now, we'll cache in Redis
            
            trade_log = {
                'user_id': user_id,
                'order_id': order_result['order_id'],
                'symbol': order_result['symbol'],
                'side': order_result['side'],
                'quantity': order_result['quantity'],
                'status': order_result['status'],
                'timestamp': datetime.now().isoformat()
            }
            
            # Store in Redis with expiration
            cache_key = f"trade_log:{user_id}:{order_result['order_id']}"
            await self.redis_client.setex(
                cache_key,
                86400,  # 24 hours
                json.dumps(trade_log)
            )
            
            logger.info(f"Trade logged: {order_result['order_id']}")
            
        except Exception as e:
            logger.error(f"Error logging trade: {e}")
    
    async def get_signal_history(self, symbol: str, days: int = 7) -> List[Dict]:
        """Get historical trading signals"""
        try:
            # Get from Redis cache
            cache_key = f"signals:{symbol}:*"
            keys = await self.redis_client.keys(cache_key)
            
            signals = []
            for key in keys:
                signal_data = await self.redis_client.get(key)
                if signal_data:
                    signal = json.loads(signal_data)
                    signal_date = datetime.fromisoformat(signal['timestamp'])
                    
                    # Filter by date range
                    if signal_date >= datetime.now() - timedelta(days=days):
                        signals.append(signal)
            
            # Sort by timestamp
            signals.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return signals
            
        except Exception as e:
            logger.error(f"Error getting signal history: {e}")
            return []
    
    async def close(self):
        """Close connections"""
        if self.redis_client:
            await self.redis_client.close()