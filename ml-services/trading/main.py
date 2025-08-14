from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uvicorn
import os
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta

from trading_engine import TradingEngine
from market_data import MarketDataManager
from risk_manager import RiskManager
from signal_generator import SignalGenerator

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Trading Engine Service",
    description="AI-powered trading signals and execution",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
trading_engine = TradingEngine()
market_data_manager = MarketDataManager()
risk_manager = RiskManager()
signal_generator = SignalGenerator()

# Pydantic models
class TradingSignalRequest(BaseModel):
    symbol: str
    sentiment_score: Optional[float] = None
    user_id: Optional[int] = None

class TradingSignal(BaseModel):
    symbol: str
    signal: str = Field(..., regex="^(buy|sell|hold)$")
    confidence: float = Field(..., ge=0, le=1)
    price: float
    sentiment_score: Optional[float] = None
    technical_indicators: Dict
    reasoning: str
    timestamp: str
    risk_level: str = Field(..., regex="^(low|medium|high)$")

class OrderRequest(BaseModel):
    symbol: str
    side: str = Field(..., regex="^(buy|sell)$")
    quantity: float = Field(..., gt=0)
    order_type: str = Field(default="market", regex="^(market|limit)$")
    limit_price: Optional[float] = None
    user_id: int

class PortfolioRequest(BaseModel):
    user_id: int

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "trading_engine": trading_engine.is_initialized,
            "market_data": market_data_manager.is_connected,
            "alpaca_connected": trading_engine.alpaca_connected
        }
    }

@app.post("/generate-signal", response_model=TradingSignal)
async def generate_trading_signal(request: TradingSignalRequest):
    """Generate trading signal for a symbol"""
    try:
        # Get current market data
        market_data = await market_data_manager.get_current_data(request.symbol)
        
        if not market_data:
            raise HTTPException(status_code=404, detail="Market data not available")
        
        # Get historical data for technical analysis
        historical_data = await market_data_manager.get_historical_data(
            request.symbol, 
            days=30
        )
        
        # Generate technical indicators
        technical_indicators = signal_generator.calculate_indicators(historical_data)
        
        # Generate trading signal
        signal_data = signal_generator.generate_signal(
            symbol=request.symbol,
            current_price=market_data['price'],
            technical_indicators=technical_indicators,
            sentiment_score=request.sentiment_score
        )
        
        # Assess risk level
        risk_level = risk_manager.assess_risk(
            symbol=request.symbol,
            signal=signal_data['signal'],
            confidence=signal_data['confidence'],
            market_data=market_data
        )
        
        trading_signal = TradingSignal(
            symbol=request.symbol,
            signal=signal_data['signal'],
            confidence=signal_data['confidence'],
            price=market_data['price'],
            sentiment_score=request.sentiment_score,
            technical_indicators=technical_indicators,
            reasoning=signal_data['reasoning'],
            timestamp=datetime.now().isoformat(),
            risk_level=risk_level
        )
        
        return trading_signal
        
    except Exception as e:
        logger.error(f"Error generating trading signal: {e}")
        raise HTTPException(status_code=500, detail="Signal generation failed")

@app.post("/execute-order")
async def execute_order(order: OrderRequest, background_tasks: BackgroundTasks):
    """Execute a trading order"""
    try:
        # Validate order with risk manager
        risk_check = risk_manager.validate_order(
            symbol=order.symbol,
            side=order.side,
            quantity=order.quantity,
            user_id=order.user_id
        )
        
        if not risk_check['approved']:
            raise HTTPException(
                status_code=400, 
                detail=f"Order rejected: {risk_check['reason']}"
            )
        
        # Execute order
        order_result = await trading_engine.execute_order(
            symbol=order.symbol,
            side=order.side,
            quantity=order.quantity,
            order_type=order.order_type,
            limit_price=order.limit_price,
            user_id=order.user_id
        )
        
        # Log order execution (background task)
        background_tasks.add_task(
            log_order_execution,
            order_result,
            order.user_id
        )
        
        return {
            "message": "Order executed successfully",
            "order_id": order_result['order_id'],
            "status": order_result['status'],
            "filled_price": order_result.get('filled_price'),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error executing order: {e}")
        raise HTTPException(status_code=500, detail="Order execution failed")

@app.get("/portfolio/{user_id}")
async def get_portfolio(user_id: int):
    """Get user's portfolio information"""
    try:
        portfolio = await trading_engine.get_portfolio(user_id)
        return portfolio
        
    except Exception as e:
        logger.error(f"Error getting portfolio: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve portfolio")

@app.get("/market-data/{symbol}")
async def get_market_data(symbol: str, days: int = 30):
    """Get historical market data for a symbol"""
    try:
        data = await market_data_manager.get_historical_data(symbol, days)
        return {
            "symbol": symbol,
            "data": data,
            "count": len(data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting market data: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve market data")

@app.get("/signals/history/{symbol}")
async def get_signal_history(symbol: str, days: int = 7):
    """Get historical trading signals for a symbol"""
    try:
        signals = await trading_engine.get_signal_history(symbol, days)
        return {
            "symbol": symbol,
            "signals": signals,
            "count": len(signals),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting signal history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve signal history")

async def log_order_execution(order_result: dict, user_id: int):
    """Background task to log order execution"""
    try:
        await trading_engine.log_trade(order_result, user_id)
        logger.info(f"Logged order execution for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error logging order execution: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8002)),
        reload=True,
        log_level="info"
    )