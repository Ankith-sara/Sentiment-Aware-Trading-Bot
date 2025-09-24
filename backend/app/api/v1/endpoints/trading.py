from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from app.database import get_db
from app.schemas.trading import (
    TradeSignal, TradeSignalCreate, 
    MarketData, TechnicalIndicators,
    TradingConfig, ChatRequest, ChatResponse,
    MarketAnalysisRequest, MarketAnalysisResponse
)
from app.services.ai_service import ai_service
from app.services.alpaca_service import alpaca_service
from app.services.trading_service import trading_service
from app.services.news_service import news_service
from app.models.trading import TradeSignal as TradeSignalModel
from app.core.exceptions import TradingException

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/signals/{symbol}", response_model=List[TradeSignal])
async def get_trade_signals(
    symbol: str,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get trading signals for a symbol"""
    try:
        # Get signals from database
        signals = db.query(TradeSignalModel).filter(
            TradeSignalModel.symbol == symbol.upper()
        ).order_by(
            TradeSignalModel.created_at.desc()
        ).limit(limit).all()
        
        return signals
        
    except Exception as e:
        logger.error(f"Failed to get trade signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/signals/generate", response_model=TradeSignal)
async def generate_trade_signal(
    symbol: str,
    config: Optional[Dict[str, Any]] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """Generate a new trading signal"""
    try:
        # Generate signal using trading service
        signal = await trading_service.generate_signal(symbol, config or {})
        
        # Save to database
        db_signal = TradeSignalModel(**signal.dict())
        db.add(db_signal)
        db.commit()
        db.refresh(db_signal)
        
        # Schedule background analysis
        background_tasks.add_task(
            trading_service.update_signal_analysis,
            db_signal.id
        )
        
        return db_signal
        
    except Exception as e:
        logger.error(f"Failed to generate signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market-data/{symbol}", response_model=List[MarketData])
async def get_market_data(
    symbol: str,
    timeframe: str = "1Day",
    limit: int = 100
):
    """Get market data for a symbol"""
    try:
        # Set date range for historical data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)  # 1 year of data
        
        market_data = await alpaca_service.get_market_data(
            symbol=symbol.upper(),
            timeframe=timeframe,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        
        return market_data
        
    except Exception as e:
        logger.error(f"Failed to get market data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current-price/{symbol}")
async def get_current_price(symbol: str):
    """Get current price for a symbol"""
    try:
        price = await alpaca_service.get_current_price(symbol.upper())
        
        if price is None:
            raise HTTPException(status_code=404, detail="Price not found")
        
        return {
            "symbol": symbol.upper(),
            "price": price,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get current price: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/technical/{symbol}", response_model=TechnicalIndicators)
async def get_technical_indicators(
    symbol: str,
    timeframe: str = "1Day"
):
    """Get technical indicators for a symbol"""
    try:
        indicators = await trading_service.calculate_technical_indicators(
            symbol.upper(),
            timeframe
        )
        
        return indicators
        
    except Exception as e:
        logger.error(f"Failed to get technical indicators: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-market", response_model=MarketAnalysisResponse)
async def analyze_market(request: MarketAnalysisRequest):
    """Perform comprehensive market analysis"""
    try:
        # Get market data
        market_data = await alpaca_service.get_market_data(
            symbol=request.symbol.upper(),
            timeframe=request.timeframe
        )
        
        # Get news if requested
        news_data = []
        if request.include_news:
            news_data = await news_service.fetch_news(
                symbol=request.symbol.upper(),
                limit=10
            )
        
        # Get technical analysis if requested
        technical_data = None
        if request.include_technical:
            technical_data = await trading_service.calculate_technical_indicators(
                request.symbol.upper(),
                request.timeframe
            )
        
        # Generate AI analysis
        analysis_text = await ai_service.analyze_market_conditions(
            request.symbol.upper(),
            [{"timestamp": md.timestamp, "price": md.close_price, "sentiment": md.sentiment} for md in market_data[-20:]],
            news_data
        )
        
        # Extract key levels (simplified - in production, use technical analysis)
        prices = [md.close_price for md in market_data[-50:]] if market_data else []
        support_levels = []
        resistance_levels = []
        
        if prices:
            recent_low = min(prices[-20:])
            recent_high = max(prices[-20:])
            support_levels = [recent_low * 0.98, recent_low * 0.95]
            resistance_levels = [recent_high * 1.02, recent_high * 1.05]
        
        # Calculate overall sentiment
        avg_sentiment = sum(item.sentiment for item in news_data) / len(news_data) if news_data else 0.0
        
        # Generate trend direction
        trend_direction = "neutral"
        if len(prices) >= 10:
            recent_avg = sum(prices[-5:]) / 5
            older_avg = sum(prices[-10:-5]) / 5
            if recent_avg > older_avg * 1.02:
                trend_direction = "bullish"
            elif recent_avg < older_avg * 0.98:
                trend_direction = "bearish"
        
        return MarketAnalysisResponse(
            symbol=request.symbol.upper(),
            analysis=analysis_text,
            trend_direction=trend_direction,
            support_levels=support_levels,
            resistance_levels=resistance_levels,
            sentiment_summary=f"Average sentiment: {avg_sentiment:.2f} ({'Bullish' if avg_sentiment > 0.2 else 'Bearish' if avg_sentiment < -0.2 else 'Neutral'})",
            risk_factors=[
                "Market volatility",
                "Economic indicators",
                "Global market conditions",
                "Sector-specific risks"
            ],
            recommendations=[
                f"Monitor price action around ₹{support_levels[0]:.2f} support" if support_levels else "Analyze support levels",
                f"Watch for breakout above ₹{resistance_levels[0]:.2f}" if resistance_levels else "Identify resistance levels",
                "Consider position sizing based on volatility",
                "Stay updated with sector news"
            ],
            confidence=0.75  # Base confidence, would be calculated in production
        )
        
    except Exception as e:
        logger.error(f"Market analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute-trade")
async def execute_trade(
    signal_id: int,
    db: Session = Depends(get_db)
):
    """Execute a trade based on signal"""
    try:
        # Get signal from database
        signal = db.query(TradeSignalModel).filter(
            TradeSignalModel.id == signal_id
        ).first()
        
        if not signal:
            raise HTTPException(status_code=404, detail="Signal not found")
        
        if signal.executed:
            raise HTTPException(status_code=400, detail="Signal already executed")
        
        # Execute trade
        result = await alpaca_service.execute_trade(signal)
        
        if result["success"]:
            # Mark signal as executed
            signal.executed = True
            db.commit()
            
            logger.info(f"Trade executed successfully: {result}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trade execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/positions")
async def get_positions():
    """Get current portfolio positions"""
    try:
        positions = await alpaca_service.get_positions()
        return positions
        
    except Exception as e:
        logger.error(f"Failed to get positions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/account")
async def get_account():
    """Get account information"""
    try:
        account_info = await alpaca_service.get_account_info()
        return account_info
        
    except Exception as e:
        logger.error(f"Failed to get account info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders")
async def get_orders(
    status: str = "all",
    limit: int = 50
):
    """Get order history"""
    try:
        orders = await alpaca_service.get_orders(status=status, limit=limit)
        return orders
        
    except Exception as e:
        logger.error(f"Failed to get orders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Chat with AI trading assistant"""
    try:
        # Build context for AI
        context = request.context or {}
        
        # Add current market context if not provided
        if "symbol" not in context:
            context["symbol"] = "NIFTY"
        
        # Get recent data for context
        if "portfolio" not in context:
            positions = await alpaca_service.get_positions()
            account = await alpaca_service.get_account_info()
            context["portfolio"] = {
                "totalValue": account.get("portfolio_value", 0),
                "dailyPnL": account.get("equity", 0) - account.get("last_equity", 0),
                "positions": positions
            }
        
        if "recentTrades" not in context:
            recent_signals = db.query(TradeSignalModel).order_by(
                TradeSignalModel.created_at.desc()
            ).limit(5).all()
            context["recentTrades"] = [
                {
                    "signal": signal.signal,
                    "symbol": signal.symbol,
                    "price": signal.price,
                    "confidence": signal.confidence,
                    "sentimentScore": signal.sentiment_score
                }
                for signal in recent_signals
            ]
        
        if "recentNews" not in context:
            news_data = await news_service.fetch_news(limit=5)
            context["recentNews"] = [
                {
                    "title": news.title,
                    "sentiment": news.sentiment,
                    "sentimentLabel": news.sentiment_label
                }
                for news in news_data
            ]
        
        # Calculate market sentiment
        if "marketSentiment" not in context:
            if context["recentNews"]:
                avg_sentiment = sum(item["sentiment"] for item in context["recentNews"]) / len(context["recentNews"])
                context["marketSentiment"] = avg_sentiment
            else:
                context["marketSentiment"] = 0.0
        
        # Generate AI response
        response = await ai_service.generate_chat_response(
            request.message,
            context
        )
        
        return ChatResponse(
            response=response,
            context=context
        )
        
    except Exception as e:
        logger.error(f"Chat request failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/watchlist/{symbol}/add")
async def add_to_watchlist(
    symbol: str,
    # user_id: int = Depends(get_current_user_id)  # TODO: Add authentication
):
    """Add symbol to watchlist"""
    try:
        # TODO: Implement user-specific watchlist storage
        return {
            "success": True,
            "message": f"{symbol.upper()} added to watchlist",
            "symbol": symbol.upper()
        }
        
    except Exception as e:
        logger.error(f"Failed to add to watchlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    # user_id: int = Depends(get_current_user_id)  # TODO: Add authentication
):
    """Remove symbol from watchlist"""
    try:
        # TODO: Implement user-specific watchlist storage
        return {
            "success": True,
            "message": f"{symbol.upper()} removed from watchlist",
            "symbol": symbol.upper()
        }
        
    except Exception as e:
        logger.error(f"Failed to remove from watchlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))