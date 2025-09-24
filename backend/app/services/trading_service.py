import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
import asyncio
from dataclasses import dataclass
import talib

from app.schemas.trading import (
    TradeSignal, TradeSignalCreate, TechnicalIndicators,
    MarketData, RiskLevel, SignalType
)
from app.services.alpaca_service import alpaca_service
from app.services.news_service import news_service
from app.services.ai_service import ai_service
from app.core.config import settings

logger = logging.getLogger(__name__)

@dataclass
class SignalWeights:
    """Weights for different signal components"""
    sentiment: float = 0.4
    technical: float = 0.4
    volume: float = 0.1
    momentum: float = 0.1

class TradingService:
    def __init__(self):
        self.signal_weights = SignalWeights()
        self.min_confidence_threshold = 0.6
        self.risk_multipliers = {
            RiskLevel.LOW: 0.5,
            RiskLevel.MEDIUM: 1.0,
            RiskLevel.HIGH: 1.5
        }
    
    async def generate_signal(
        self,
        symbol: str,
        config: Dict[str, Any],
        user_id: Optional[int] = None
    ) -> TradeSignal:
        """Generate a comprehensive trading signal"""
        try:
            # Get market data
            market_data = await alpaca_service.get_market_data(
                symbol=symbol,
                timeframe="1Day",
                limit=200  # Need enough data for technical indicators
            )
            
            if len(market_data) < 50:
                raise ValueError(f"Insufficient market data for {symbol}")
            
            # Get news and sentiment
            news_data = await news_service.fetch_news(symbol=symbol, limit=20)
            
            # Calculate technical indicators
            technical_indicators = await self.calculate_technical_indicators_from_data(market_data)
            
            # Calculate individual scores
            sentiment_score = await self._calculate_sentiment_score(news_data)
            technical_score = self._calculate_technical_score(technical_indicators, market_data)
            volume_score = self._calculate_volume_score(market_data)
            momentum_score = self._calculate_momentum_score(market_data)
            
            # Calculate combined score
            combined_score = (
                sentiment_score * self.signal_weights.sentiment +
                technical_score * self.signal_weights.technical +
                volume_score * self.signal_weights.volume +
                momentum_score * self.signal_weights.momentum
            )
            
            # Determine signal type
            signal_type = self._determine_signal_type(combined_score, config)
            
            # Calculate confidence
            confidence = self._calculate_confidence([
                sentiment_score, technical_score, volume_score, momentum_score
            ])
            
            # Determine risk level
            risk_level = self._calculate_risk_level(
                market_data, news_data, technical_indicators
            )
            
            # Get current price
            current_price = market_data[-1].close_price
            
            # Calculate recommended quantity
            recommended_qty = self._calculate_position_size(
                current_price, risk_level, config
            )
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                signal_type, sentiment_score, technical_score, 
                volume_score, momentum_score, symbol
            )
            
            # Create signal
            signal = TradeSignal(
                id=0,  # Will be set by database
                user_id=user_id,
                symbol=symbol,
                signal=signal_type,
                price=current_price,
                quantity=recommended_qty,
                confidence=confidence,
                sentiment_score=sentiment_score,
                technical_score=technical_score,
                combined_score=combined_score,
                risk_level=risk_level,
                reason=reasoning,
                executed=False,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=24)
            )
            
            return signal
            
        except Exception as e:
            logger.error(f"Signal generation failed for {symbol}: {e}")
            raise
    
    async def calculate_technical_indicators(
        self,
        symbol: str,
        timeframe: str = "1Day"
    ) -> TechnicalIndicators:
        """Calculate technical indicators for a symbol"""
        try:
            market_data = await alpaca_service.get_market_data(
                symbol=symbol,
                timeframe=timeframe,
                limit=200
            )
            
            if len(market_data) < 50:
                raise ValueError(f"Insufficient data for technical analysis of {symbol}")
            
            return await self.calculate_technical_indicators_from_data(market_data)
            
        except Exception as e:
            logger.error(f"Technical analysis failed for {symbol}: {e}")
            raise
    
    async def calculate_technical_indicators_from_data(
        self,
        market_data: List[MarketData]
    ) -> TechnicalIndicators:
        """Calculate technical indicators from market data"""
        try:
            # Convert to pandas DataFrame
            df = pd.DataFrame([
                {
                    'timestamp': md.timestamp,
                    'open': md.open_price,
                    'high': md.high_price,
                    'low': md.low_price,
                    'close': md.close_price,
                    'volume': md.volume
                }
                for md in market_data
            ])
            
            # Convert to numpy arrays for talib
            close = df['close'].values.astype(float)
            high = df['high'].values.astype(float)
            low = df['low'].values.astype(float)
            volume = df['volume'].values.astype(float)
            
            # Calculate indicators using TA-Lib
            try:
                # Moving averages
                sma_20 = talib.SMA(close, timeperiod=20)
                sma_50 = talib.SMA(close, timeperiod=50)
                ema_12 = talib.EMA(close, timeperiod=12)
                ema_26 = talib.EMA(close, timeperiod=26)
                
                # MACD
                macd, macd_signal, macd_hist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
                
                # RSI
                rsi = talib.RSI(close, timeperiod=14)
                
                # Bollinger Bands
                bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)
                
                # Stochastic
                stoch_k, stoch_d = talib.STOCH(high, low, close, fastk_period=5, slowk_period=3, slowk_matype=0, slowd_period=3, slowd_matype=0)
                
                # Williams %R
                williams_r = talib.WILLR(high, low, close, timeperiod=14)
                
                # ATR
                atr = talib.ATR(high, low, close, timeperiod=14)
                
            except Exception as talib_error:
                logger.warning(f"TA-Lib calculation failed, using simple calculations: {talib_error}")
                # Fallback to simple calculations
                sma_20 = df['close'].rolling(20).mean().values
                sma_50 = df['close'].rolling(50).mean().values
                ema_12 = df['close'].ewm(span=12).mean().values
                ema_26 = df['close'].ewm(span=26).mean().values
                macd = ema_12 - ema_26
                macd_signal = pd.Series(macd).ewm(span=9).mean().values
                rsi = self._calculate_rsi(close)
                bb_upper = df['close'].rolling(20).mean() + df['close'].rolling(20).std() * 2
                bb_lower = df['close'].rolling(20).mean() - df['close'].rolling(20).std() * 2
                bb_middle = df['close'].rolling(20).mean()
                stoch_k = np.full(len(close), 50.0)
                stoch_d = np.full(len(close), 50.0)
                williams_r = np.full(len(close), -50.0)
                atr = df['high'].subtract(df['low']).rolling(14).mean().values
            
            # Get latest values (handle NaN)
            latest_idx = -1
            
            return TechnicalIndicators(
                symbol=market_data[0].symbol,
                timestamp=market_data[-1].timestamp,
                sma_20=float(sma_20[latest_idx]) if not np.isnan(sma_20[latest_idx]) else None,
                sma_50=float(sma_50[latest_idx]) if not np.isnan(sma_50[latest_idx]) else None,
                ema_12=float(ema_12[latest_idx]) if not np.isnan(ema_12[latest_idx]) else None,
                ema_26=float(ema_26[latest_idx]) if not np.isnan(ema_26[latest_idx]) else None,
                rsi=float(rsi[latest_idx]) if not np.isnan(rsi[latest_idx]) else None,
                macd=float(macd[latest_idx]) if not np.isnan(macd[latest_idx]) else None,
                macd_signal=float(macd_signal[latest_idx]) if not np.isnan(macd_signal[latest_idx]) else None,
                macd_histogram=float(macd[latest_idx] - macd_signal[latest_idx]) if not (np.isnan(macd[latest_idx]) or np.isnan(macd_signal[latest_idx])) else None,
                bollinger_upper=float(bb_upper.iloc[latest_idx]) if hasattr(bb_upper, 'iloc') and not pd.isna(bb_upper.iloc[latest_idx]) else None,
                bollinger_middle=float(bb_middle.iloc[latest_idx]) if hasattr(bb_middle, 'iloc') and not pd.isna(bb_middle.iloc[latest_idx]) else None,
                bollinger_lower=float(bb_lower.iloc[latest_idx]) if hasattr(bb_lower, 'iloc') and not pd.isna(bb_lower.iloc[latest_idx]) else None,
                stochastic_k=float(stoch_k[latest_idx]) if not np.isnan(stoch_k[latest_idx]) else None,
                stochastic_d=float(stoch_d[latest_idx]) if not np.isnan(stoch_d[latest_idx]) else None,
                williams_r=float(williams_r[latest_idx]) if not np.isnan(williams_r[latest_idx]) else None,
                atr=float(atr[latest_idx]) if not np.isnan(atr[latest_idx]) else None
            )
            
        except Exception as e:
            logger.error(f"Technical indicator calculation failed: {e}")
            raise
    
    def _calculate_rsi(self, prices: np.ndarray, period: int = 14) -> np.ndarray:
        """Calculate RSI manually if TA-Lib fails"""
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gains = np.convolve(gains, np.ones(period)/period, mode='valid')
        avg_losses = np.convolve(losses, np.ones(period)/period, mode='valid')
        
        rs = avg_gains / (avg_losses + 1e-10)
        rsi = 100 - (100 / (1 + rs))
        
        # Pad with NaN to match original length
        return np.concatenate([np.full(period, np.nan), rsi])
    
    async def _calculate_sentiment_score(self, news_data: List) -> float:
        """Calculate sentiment score from news"""
        if not news_data:
            return 0.0
        
        # Weight recent news more heavily
        total_weight = 0
        weighted_sentiment = 0
        
        for i, news in enumerate(news_data):
            # More recent news gets higher weight
            weight = 1.0 / (i + 1)  # First news gets weight 1, second gets 0.5, etc.
            
            sentiment = news.sentiment * news.sentiment_confidence
            weighted_sentiment += sentiment * weight
            total_weight += weight
        
        return weighted_sentiment / total_weight if total_weight > 0 else 0.0
    
    def _calculate_technical_score(
        self,
        indicators: TechnicalIndicators,
        market_data: List[MarketData]
    ) -> float:
        """Calculate technical analysis score"""
        score = 0.0
        signals_count = 0
        current_price = market_data[-1].close_price
        
        # RSI signals
        if indicators.rsi is not None:
            if indicators.rsi < 30:  # Oversold
                score += 0.7
            elif indicators.rsi > 70:  # Overbought
                score -= 0.7
            elif 40 <= indicators.rsi <= 60:  # Neutral
                score += 0.1
            signals_count += 1
        
        # MACD signals
        if indicators.macd is not None and indicators.macd_signal is not None:
            if indicators.macd > indicators.macd_signal:  # Bullish
                score += 0.5
            else:  # Bearish
                score -= 0.5
            signals_count += 1
        
        # Moving average signals
        if indicators.sma_20 is not None and indicators.sma_50 is not None:
            if indicators.sma_20 > indicators.sma_50:  # Golden cross region
                score += 0.6
            else:  # Death cross region
                score -= 0.6
            signals_count += 1
        
        # Price vs moving average
        if indicators.sma_20 is not None:
            price_vs_sma = (current_price - indicators.sma_20) / indicators.sma_20
            score += min(max(price_vs_sma * 2, -0.5), 0.5)  # Cap at +/-0.5
            signals_count += 1
        
        # Bollinger Bands signals
        if all([indicators.bollinger_upper, indicators.bollinger_lower, indicators.bollinger_middle]):
            bb_position = (current_price - indicators.bollinger_lower) / (indicators.bollinger_upper - indicators.bollinger_lower)
            if bb_position < 0.2:  # Near lower band - oversold
                score += 0.4
            elif bb_position > 0.8:  # Near upper band - overbought
                score -= 0.4
            signals_count += 1
        
        # Stochastic signals
        if indicators.stochastic_k is not None:
            if indicators.stochastic_k < 20:  # Oversold
                score += 0.3
            elif indicators.stochastic_k > 80:  # Overbought
                score -= 0.3
            signals_count += 1
        
        return score / signals_count if signals_count > 0 else 0.0
    
    def _calculate_volume_score(self, market_data: List[MarketData]) -> float:
        """Calculate volume-based score"""
        if len(market_data) < 20:
            return 0.0
        
        # Get recent volumes
        recent_volumes = [md.volume for md in market_data[-5:]]
        avg_volume = sum([md.volume for md in market_data[-20:-5]]) / 15
        
        if avg_volume == 0:
            return 0.0
        
        # Current volume vs average
        current_volume = recent_volumes[-1]
        volume_ratio = current_volume / avg_volume
        
        # High volume can indicate strong moves
        if volume_ratio > 1.5:
            return 0.5  # Above average volume
        elif volume_ratio < 0.5:
            return -0.2  # Below average volume
        else:
            return 0.1  # Normal volume
    
    def _calculate_momentum_score(self, market_data: List[MarketData]) -> float:
        """Calculate price momentum score"""
        if len(market_data) < 10:
            return 0.0
        
        # Calculate price changes over different periods
        current_price = market_data[-1].close_price
        
        # 1-day momentum
        day_1_return = (current_price - market_data[-2].close_price) / market_data[-2].close_price
        
        # 5-day momentum
        day_5_return = (current_price - market_data[-6].close_price) / market_data[-6].close_price if len(market_data) >= 6 else 0
        
        # 10-day momentum
        day_10_return = (current_price - market_data[-11].close_price) / market_data[-11].close_price if len(market_data) >= 11 else 0
        
        # Weight different periods
        momentum_score = (
            day_1_return * 0.5 +
            day_5_return * 0.3 +
            day_10_return * 0.2
        )
        
        # Cap the score
        return min(max(momentum_score * 10, -1.0), 1.0)
    
    def _determine_signal_type(self, combined_score: float, config: Dict[str, Any]) -> SignalType:
        """Determine signal type based on combined score"""
        buy_threshold = config.get('buy_threshold', 0.3)
        sell_threshold = config.get('sell_threshold', -0.3)
        
        if combined_score >= buy_threshold:
            return SignalType.BUY
        elif combined_score <= sell_threshold:
            return SignalType.SELL
        else:
            return SignalType.HOLD
    
    def _calculate_confidence(self, scores: List[float]) -> float:
        """Calculate confidence based on score agreement"""
        # Remove None values
        valid_scores = [s for s in scores if s is not None]
        
        if not valid_scores:
            return 0.0
        
        # Check agreement between scores
        positive_scores = sum(1 for s in valid_scores if s > 0.1)
        negative_scores = sum(1 for s in valid_scores if s < -0.1)
        neutral_scores = len(valid_scores) - positive_scores - negative_scores
        
        # Higher confidence when scores agree
        max_agreement = max(positive_scores, negative_scores, neutral_scores)
        agreement_ratio = max_agreement / len(valid_scores)
        
        # Base confidence on score magnitude and agreement
        avg_magnitude = sum(abs(s) for s in valid_scores) / len(valid_scores)
        
        confidence = (agreement_ratio * 0.6 + avg_magnitude * 0.4)
        return min(confidence, 1.0)
    
    def _calculate_risk_level(
        self,
        market_data: List[MarketData],
        news_data: List,
        indicators: TechnicalIndicators
    ) -> RiskLevel:
        """Calculate risk level for the signal"""
        risk_factors = 0
        
        # Volatility check
        if len(market_data) >= 20:
            recent_prices = [md.close_price for md in market_data[-20:]]
            volatility = np.std(recent_prices) / np.mean(recent_prices)
            if volatility > 0.03:  # 3% daily volatility
                risk_factors += 1
        
        # ATR check
        if indicators.atr and len(market_data) > 0:
            atr_ratio = indicators.atr / market_data[-1].close_price
            if atr_ratio > 0.025:  # High ATR relative to price
                risk_factors += 1
        
        # News sentiment volatility
        if news_data:
            sentiments = [news.sentiment for news in news_data[:5]]
            sentiment_std = np.std(sentiments) if len(sentiments) > 1 else 0
            if sentiment_std > 0.5:  # High sentiment volatility
                risk_factors += 1
        
        # RSI extremes
        if indicators.rsi:
            if indicators.rsi > 80 or indicators.rsi < 20:
                risk_factors += 1
        
        # Determine risk level
        if risk_factors >= 3:
            return RiskLevel.HIGH
        elif risk_factors >= 1:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _calculate_position_size(
        self,
        current_price: float,
        risk_level: RiskLevel,
        config: Dict[str, Any]
    ) -> int:
        """Calculate recommended position size"""
        max_position_size = config.get('max_position_size', settings.MAX_POSITION_SIZE)
        risk_multiplier = self.risk_multipliers[risk_level]
        
        # Adjust position size based on risk
        adjusted_position_size = max_position_size / risk_multiplier
        
        # Calculate quantity
        quantity = int(adjusted_position_size / current_price)
        
        # Minimum and maximum bounds
        return max(1, min(quantity, 1000))
    
    def _generate_reasoning(
        self,
        signal_type: SignalType,
        sentiment_score: float,
        technical_score: float,
        volume_score: float,
        momentum_score: float,
        symbol: str
    ) -> str:
        """Generate human-readable reasoning for the signal"""
        reasons = []
        
        # Sentiment reasoning
        if sentiment_score > 0.3:
            reasons.append("Strong positive market sentiment from recent news")
        elif sentiment_score < -0.3:
            reasons.append("Negative sentiment from recent market news")
        elif abs(sentiment_score) < 0.1:
            reasons.append("Neutral sentiment in recent news coverage")
        
        # Technical reasoning
        if technical_score > 0.4:
            reasons.append("Strong bullish technical indicators")
        elif technical_score < -0.4:
            reasons.append("Bearish technical signals present")
        elif abs(technical_score) < 0.1:
            reasons.append("Mixed technical signals")
        
        # Volume reasoning
        if volume_score > 0.3:
            reasons.append("Above-average trading volume supporting the move")
        elif volume_score < 0:
            reasons.append("Below-average volume may indicate weak conviction")
        
        # Momentum reasoning
        if momentum_score > 0.3:
            reasons.append("Strong upward price momentum")
        elif momentum_score < -0.3:
            reasons.append("Downward price momentum observed")
        
        # Signal-specific reasoning
        if signal_type == SignalType.BUY:
            reasons.append(f"Multiple factors align for a potential buying opportunity in {symbol}")
        elif signal_type == SignalType.SELL:
            reasons.append(f"Risk indicators suggest considering a sell position in {symbol}")
        else:
            reasons.append(f"Mixed signals recommend holding current position in {symbol}")
        
        return ". ".join(reasons) + "."
    
    async def update_signal_analysis(self, signal_id: int):
        """Background task to update signal analysis"""
        try:
            # This would update the signal with additional analysis
            # For now, it's a placeholder for future enhancements
            logger.info(f"Background analysis started for signal {signal_id}")
            
        except Exception as e:
            logger.error(f"Background signal analysis failed: {e}")

# Global trading service instance
trading_service = TradingService()