from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class SignalType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

# Base schemas
class BaseSchema(BaseModel):
    class Config:
        orm_mode = True

# News schemas
class NewsItemBase(BaseModel):
    title: str = Field(..., description="News title")
    content: Optional[str] = Field(None, description="News content")
    summary: Optional[str] = Field(None, description="News summary")
    url: str = Field(..., description="News URL")
    source: str = Field(..., description="News source")
    author: Optional[str] = Field(None, description="News author")
    published_at: datetime = Field(..., description="Publication date")

class NewsItemCreate(NewsItemBase):
    symbols: List[str] = Field(default=[], description="Related symbols")
    categories: List[str] = Field(default=[], description="News categories")

class NewsItem(NewsItemBase):
    id: int
    sentiment: float = Field(..., ge=-1, le=1, description="Sentiment score")
    sentiment_label: SentimentLabel = Field(..., description="Sentiment label")
    sentiment_confidence: float = Field(..., ge=0, le=1, description="Sentiment confidence")
    symbols: List[str] = []
    categories: List[str] = []
    created_at: datetime
    
    class Config:
        orm_mode = True

# Market data schemas
class MarketDataBase(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    timestamp: datetime = Field(..., description="Data timestamp")
    open_price: float = Field(..., description="Opening price")
    high_price: float = Field(..., description="High price")
    low_price: float = Field(..., description="Low price")
    close_price: float = Field(..., description="Closing price")
    volume: int = Field(..., description="Trading volume")
    timeframe: str = Field(..., description="Timeframe (1m, 5m, 1h, 1d)")

class MarketDataCreate(MarketDataBase):
    pass

class MarketData(MarketDataBase):
    id: int
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_lower: Optional[float] = None
    sentiment: float = 0.0
    
    class Config:
        orm_mode = True

# Price data for frontend compatibility
class PriceData(BaseModel):
    timestamp: datetime = Field(..., description="Data timestamp")
    price: float = Field(..., description="Price")
    volume: int = Field(..., description="Volume")
    sentiment: float = Field(..., ge=-1, le=1, description="Sentiment score")

# Chat schemas
class ChatMessageBase(BaseModel):
    message: str = Field(..., description="User message")
    message_type: str = Field(default="general", description="Message type")
    context: Dict[str, Any] = Field(default={}, description="Message context")

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    user_id: int
    response: str = Field(..., description="AI response")
    created_at: datetime
    
    class Config:
        orm_mode = True

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    context: Optional[Dict[str, Any]] = Field(None, description="Chat context")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI response")
    context: Optional[Dict[str, Any]] = Field(None, description="Updated context")

# Technical analysis schemas
class TechnicalIndicators(BaseModel):
    symbol: str
    timestamp: datetime
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_middle: Optional[float] = None
    bollinger_lower: Optional[float] = None
    stochastic_k: Optional[float] = None
    stochastic_d: Optional[float] = None
    williams_r: Optional[float] = None
    atr: Optional[float] = None

# Sentiment analysis schemas
class SentimentAnalysis(BaseModel):
    text: str = Field(..., description="Text to analyze")

class SentimentResult(BaseModel):
    score: float = Field(..., ge=-1, le=1, description="Sentiment score")
    label: SentimentLabel = Field(..., description="Sentiment label")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")

# Trading configuration schemas
class TradingConfig(BaseModel):
    symbol: str = Field(default="RELIANCE", description="Primary symbol")
    buy_threshold: float = Field(default=0.2, ge=-1, le=1, description="Buy threshold")
    sell_threshold: float = Field(default=-0.2, ge=-1, le=1, description="Sell threshold")
    risk_tolerance: RiskLevel = Field(default=RiskLevel.MEDIUM, description="Risk tolerance")
    max_position_size: float = Field(default=10000.0, description="Max position size")
    enable_notifications: bool = Field(default=True, description="Enable notifications")
    enable_paper_trading: bool = Field(default=True, description="Paper trading mode")
    stop_loss_percent: float = Field(default=5.0, description="Stop loss percentage")
    take_profit_percent: float = Field(default=10.0, description="Take profit percentage")
    sentiment_weight: float = Field(default=0.6, ge=0, le=1, description="Sentiment weight")
    technical_weight: float = Field(default=0.4, ge=0, le=1, description="Technical weight")

    @validator('sentiment_weight', 'technical_weight')
    def weights_must_sum_to_one(cls, v, values):
        if 'sentiment_weight' in values:
            if abs(v + values['sentiment_weight'] - 1.0) > 0.01:
                raise ValueError('sentiment_weight + technical_weight must equal 1.0')
        return v

# Backtesting schemas
class BacktestConfig(BaseModel):
    symbol: str = Field(..., description="Symbol to backtest")
    start_date: datetime = Field(..., description="Backtest start date")
    end_date: datetime = Field(..., description="Backtest end date")
    initial_capital: float = Field(default=100000.0, description="Initial capital")
    trading_config: TradingConfig = Field(..., description="Trading configuration")
    commission: float = Field(default=0.001, description="Commission rate")

class BacktestResult(BaseModel):
    id: int
    name: str
    symbol: str
    start_date: datetime
    end_date: datetime
    total_return: float
    annualized_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    trades_data: List[Dict[str, Any]] = []
    equity_curve: List[Dict[str, Any]] = []
    metrics: Dict[str, Any] = {}
    created_at: datetime
    
    class Config:
        orm_mode = True

# User preference schemas
class AlertSettings(BaseModel):
    email: bool = Field(default=True, description="Email alerts")
    push: bool = Field(default=True, description="Push notifications")
    telegram: bool = Field(default=False, description="Telegram alerts")

class UserPreferences(BaseModel):
    favorite_symbols: List[str] = Field(default=[], description="Favorite symbols")
    ignored_symbols: List[str] = Field(default=[], description="Ignored symbols")
    alert_settings: AlertSettings = Field(default=AlertSettings(), description="Alert settings")
    trading_style: str = Field(default="moderate", description="Trading style")
    time_horizon: str = Field(default="medium", description="Investment time horizon")

# Market analysis schemas
class MarketAnalysisRequest(BaseModel):
    symbol: str = Field(..., description="Symbol to analyze")
    timeframe: str = Field(default="1d", description="Analysis timeframe")
    include_news: bool = Field(default=True, description="Include news analysis")
    include_technical: bool = Field(default=True, description="Include technical analysis")

class MarketAnalysisResponse(BaseModel):
    symbol: str
    analysis: str = Field(..., description="Market analysis text")
    trend_direction: str = Field(..., description="Trend direction")
    support_levels: List[float] = Field(default=[], description="Support levels")
    resistance_levels: List[float] = Field(default=[], description="Resistance levels")
    sentiment_summary: str = Field(..., description="Sentiment summary")
    risk_factors: List[str] = Field(default=[], description="Risk factors")
    recommendations: List[str] = Field(default=[], description="Trading recommendations")
    confidence: float = Field(..., ge=0, le=1, description="Analysis confidence")

# Health check schema
class HealthCheck(BaseModel):
    status: str = Field(..., description="Service status")
    timestamp: str = Field(..., description="Check timestamp")
    services: Dict[str, str] = Field(default={}, description="Service statuses")

# Portfolio schemas
class PositionBase(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    quantity: int = Field(..., description="Number of shares")
    avg_price: float = Field(..., description="Average purchase price")

class PositionCreate(PositionBase):
    pass

class PositionUpdate(BaseModel):
    quantity: Optional[int] = None
    current_price: Optional[float] = None

class Position(PositionBase):
    id: int
    portfolio_id: int
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    day_change: float
    day_change_percent: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class PortfolioBase(BaseModel):
    name: str = Field(default="Default Portfolio", description="Portfolio name")

class PortfolioCreate(PortfolioBase):
    cash_balance: float = Field(default=100000.0, description="Initial cash balance")

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    total_value: float
    cash_balance: float
    daily_pnl: float
    total_pnl: float
    positions: List[Position] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Trading signal schemas
class TradeSignalBase(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    signal: SignalType = Field(..., description="Trading signal")
    price: float = Field(..., description="Signal price")
    quantity: int = Field(default=10, description="Recommended quantity")
    confidence: float = Field(..., ge=0, le=1, description="Signal confidence")
    sentiment_score: float = Field(..., ge=-1, le=1, description="Sentiment score")
    technical_score: float = Field(..., ge=-1, le=1, description="Technical score")
    risk_level: RiskLevel = Field(..., description="Risk level")
    reason: str = Field(..., description="Signal reasoning")

class TradeSignalCreate(TradeSignalBase):
    expires_at: Optional[datetime] = None

class TradeSignal(TradeSignalBase):
    id: int
    user_id: Optional[int] = None
    combined_score: float
    executed: bool = False
    created_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True