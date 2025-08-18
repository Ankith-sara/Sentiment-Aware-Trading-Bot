from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import time
import logging
import asyncio
import aiohttp
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Trading Engine Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "your-alpaca-key")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "your-alpaca-secret")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "your-finnhub-key")
SENTIMENT_SERVICE_URL = os.getenv("SENTIMENT_SERVICE_URL", "http://localhost:8001")

class TradingSignal(BaseModel):
    symbol: str
    action: str  # 'buy', 'sell', 'hold'
    confidence: float
    sentiment_score: float
    technical_score: float
    combined_score: float
    reasoning: str
    timestamp: str

class MarketDataRequest(BaseModel):
    symbols: List[str]
    timeframe: Optional[str] = "1D"

class MarketDataResponse(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    timestamp: str

class TradeExecutionRequest(BaseModel):
    signal: TradingSignal
    quantity: int

class TradingEngine:
    def __init__(self):
        self.sentiment_weights = 0.7
        self.technical_weights = 0.3
        
    async def get_market_data(self, symbols: List[str]) -> List[MarketDataResponse]:
        """Fetch real-time market data from Finnhub API"""
        try:
            market_data = []
            
            async with aiohttp.ClientSession() as session:
                for symbol in symbols:
                    # Mock data for demo - replace with real Finnhub API calls
                    price = 100 + np.random.normal(0, 10)
                    change = np.random.normal(0, 2)
                    change_percent = (change / price) * 100
                    volume = int(np.random.uniform(1000000, 10000000))
                    
                    market_data.append(MarketDataResponse(
                        symbol=symbol,
                        price=round(price, 2),
                        change=round(change, 2),
                        change_percent=round(change_percent, 2),
                        volume=volume,
                        timestamp=datetime.now().isoformat()
                    ))
                    
            return market_data
            
        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Market data fetch failed: {str(e)}")
    
    async def get_sentiment_score(self, symbol: str) -> float:
        """Get sentiment score from sentiment service"""
        try:
            # Mock news headline for the symbol
            news_text = f"Latest earnings report for {symbol} shows strong performance"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{SENTIMENT_SERVICE_URL}/sentiment/analyze",
                    json={"text": news_text, "source": "financial_news"}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result["sentiment_score"]
                    else:
                        # Fallback to random sentiment if service unavailable
                        return np.random.uniform(0.3, 0.8)
                        
        except Exception as e:
            logger.warning(f"Sentiment service unavailable, using fallback: {str(e)}")
            return np.random.uniform(0.3, 0.8)
    
    def calculate_technical_score(self, symbol: str, market_data: MarketDataResponse) -> float:
        """Calculate technical analysis score"""
        try:
            # Simplified technical analysis - in production, use TA-Lib
            # This is a mock implementation
            
            # RSI-like calculation (simplified)
            price_momentum = market_data.change_percent / 100
            rsi_score = 0.5 + (price_momentum * 0.3)  # Normalize to 0-1
            
            # Volume analysis
            volume_score = min(market_data.volume / 5000000, 1.0)  # Normalize volume
            
            # Price trend (simplified moving average concept)
            trend_score = 0.5 + np.random.normal(0, 0.2)  # Mock trend analysis
            
            # Combine technical indicators
            technical_score = (rsi_score * 0.4 + volume_score * 0.3 + trend_score * 0.3)
            
            return max(0, min(1, technical_score))  # Clamp to 0-1
            
        except Exception as e:
            logger.error(f"Technical analysis error: {str(e)}")
            return 0.5  # Neutral score on error
    
    def generate_trading_signal(self, symbol: str, sentiment_score: float, 
                              technical_score: float, market_data: MarketDataResponse) -> TradingSignal:
        """Generate trading signal based on sentiment and technical analysis"""
        
        # Combine scores with weights
        combined_score = (sentiment_score * self.sentiment_weights + 
                         technical_score * self.technical_weights)
        
        # Determine action based on combined score
        if combined_score >= 0.65:
            action = "buy"
            confidence = min(combined_score * 1.2, 1.0)
        elif combined_score <= 0.35:
            action = "sell"
            confidence = min((1 - combined_score) * 1.2, 1.0)
        else:
            action = "hold"
            confidence = 0.5 + abs(combined_score - 0.5)
        
        # Generate reasoning
        sentiment_desc = "bullish" if sentiment_score > 0.6 else "bearish" if sentiment_score < 0.4 else "neutral"
        technical_desc = "strong" if technical_score > 0.6 else "weak" if technical_score < 0.4 else "mixed"
        
        reasoning = f"Sentiment analysis shows {sentiment_desc} outlook ({sentiment_score:.2f}), " \
                   f"technical indicators are {technical_desc} ({technical_score:.2f}). " \
                   f"Combined score: {combined_score:.2f} suggests {action.upper()} action."
        
        return TradingSignal(
            symbol=symbol,
            action=action,
            confidence=round(confidence, 3),
            sentiment_score=round(sentiment_score, 3),
            technical_score=round(technical_score, 3),
            combined_score=round(combined_score, 3),
            reasoning=reasoning,
            timestamp=datetime.now().isoformat()
        )

# Initialize trading engine
trading_engine = TradingEngine()

@app.get("/")
async def root():
    return {"message": "Trading Engine Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "alpaca_configured": bool(ALPACA_API_KEY != "your-alpaca-key"),
            "finnhub_configured": bool(FINNHUB_API_KEY != "your-finnhub-key"),
            "sentiment_service": SENTIMENT_SERVICE_URL
        }
    }

@app.post("/trading/market-data", response_model=List[MarketDataResponse])
async def get_market_data(request: MarketDataRequest):
    """Get real-time market data for symbols"""
    try:
        market_data = await trading_engine.get_market_data(request.symbols)
        logger.info(f"Retrieved market data for {len(request.symbols)} symbols")
        return market_data
        
    except Exception as e:
        logger.error(f"Error getting market data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Market data retrieval failed: {str(e)}")

@app.post("/trading/signals", response_model=List[TradingSignal])
async def generate_trading_signals(request: Dict[str, List[str]]):
    """Generate trading signals for given symbols"""
    try:
        symbols = request.get("symbols", [])
        signals = []
        
        # Get market data for all symbols
        market_data_list = await trading_engine.get_market_data(symbols)
        market_data_dict = {data.symbol: data for data in market_data_list}
        
        # Generate signals for each symbol
        for symbol in symbols:
            market_data = market_data_dict.get(symbol)
            if not market_data:
                continue
                
            # Get sentiment and technical scores
            sentiment_score = await trading_engine.get_sentiment_score(symbol)
            technical_score = trading_engine.calculate_technical_score(symbol, market_data)
            
            # Generate trading signal
            signal = trading_engine.generate_trading_signal(
                symbol, sentiment_score, technical_score, market_data
            )
            signals.append(signal)
        
        logger.info(f"Generated {len(signals)} trading signals")
        return signals
        
    except Exception as e:
        logger.error(f"Error generating trading signals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Signal generation failed: {str(e)}")

@app.post("/trading/execute")
async def execute_trade(request: TradeExecutionRequest):
    """Execute a trade based on trading signal"""
    try:
        signal = request.signal
        quantity = request.quantity
        
        # In production, this would integrate with Alpaca API
        # For demo, we'll simulate the trade execution
        
        trade_value = quantity * 100  # Mock price calculation
        
        execution_result = {
            "trade_id": f"trade_{int(time.time())}",
            "symbol": signal.symbol,
            "action": signal.action,
            "quantity": quantity,
            "estimated_value": trade_value,
            "status": "executed",
            "timestamp": datetime.now().isoformat(),
            "reasoning": signal.reasoning
        }
        
        logger.info(f"Executed {signal.action} order for {quantity} shares of {signal.symbol}")
        return execution_result
        
    except Exception as e:
        logger.error(f"Error executing trade: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Trade execution failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)