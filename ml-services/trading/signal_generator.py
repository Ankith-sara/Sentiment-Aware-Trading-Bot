import pandas as pd
import numpy as np
import talib
from typing import Dict, Any, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class SignalGenerator:
    def __init__(self):
        self.indicators = {}
    
    def calculate_indicators(self, historical_data: List[Dict]) -> Dict[str, Any]:
        """Calculate technical indicators from historical data"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame(historical_data)
            df = df.sort_values('timestamp')
            
            # Extract price arrays
            high = df['high'].astype(float).values
            low = df['low'].astype(float).values
            close = df['close'].astype(float).values
            volume = df['volume'].astype(float).values
            
            indicators = {}
            
            # Moving Averages
            indicators['sma_20'] = talib.SMA(close, timeperiod=20)[-1] if len(close) >= 20 else None
            indicators['sma_50'] = talib.SMA(close, timeperiod=50)[-1] if len(close) >= 50 else None
            indicators['ema_12'] = talib.EMA(close, timeperiod=12)[-1] if len(close) >= 12 else None
            indicators['ema_26'] = talib.EMA(close, timeperiod=26)[-1] if len(close) >= 26 else None
            
            # RSI
            indicators['rsi'] = talib.RSI(close, timeperiod=14)[-1] if len(close) >= 14 else None
            
            # MACD
            if len(close) >= 26:
                macd, macdsignal, macdhist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
                indicators['macd'] = macd[-1]
                indicators['macd_signal'] = macdsignal[-1]
                indicators['macd_histogram'] = macdhist[-1]
            
            # Bollinger Bands
            if len(close) >= 20:
                bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20)
                indicators['bb_upper'] = bb_upper[-1]
                indicators['bb_middle'] = bb_middle[-1]
                indicators['bb_lower'] = bb_lower[-1]
                indicators['bb_percent'] = (close[-1] - bb_lower[-1]) / (bb_upper[-1] - bb_lower[-1])
            
            # Stochastic
            if len(close) >= 14:
                slowk, slowd = talib.STOCH(high, low, close, fastk_period=14, slowk_period=3, slowd_period=3)
                indicators['stoch_k'] = slowk[-1]
                indicators['stoch_d'] = slowd[-1]
            
            # Average True Range (volatility)
            if len(close) >= 14:
                indicators['atr'] = talib.ATR(high, low, close, timeperiod=14)[-1]
            
            # Volume indicators
            if len(close) >= 20:
                indicators['volume_sma'] = talib.SMA(volume, timeperiod=20)[-1]
                indicators['volume_ratio'] = volume[-1] / indicators['volume_sma'] if indicators['volume_sma'] > 0 else 1
            
            # Current price info
            indicators['current_price'] = close[-1]
            indicators['price_change'] = (close[-1] - close[-2]) / close[-2] if len(close) > 1 else 0
            indicators['high_24h'] = max(high[-24:]) if len(high) >= 24 else high[-1]
            indicators['low_24h'] = min(low[-24:]) if len(low) >= 24 else low[-1]
            
            return indicators
            
        except Exception as e:
            logger.error(f"Error calculating indicators: {e}")
            return {}
    
    def generate_signal(
        self,
        symbol: str,
        current_price: float,
        technical_indicators: Dict,
        sentiment_score: float = None
    ) -> Dict[str, Any]:
        """Generate trading signal based on technical analysis and sentiment"""
        try:
            # Initialize signal components
            technical_score = 0
            sentiment_weight = 0
            total_weight = 0
            reasoning_parts = []
            
            # Technical Analysis Scoring
            
            # 1. Moving Average Analysis
            sma_20 = technical_indicators.get('sma_20')
            sma_50 = technical_indicators.get('sma_50')
            
            if sma_20 and sma_50:
                if current_price > sma_20 > sma_50:
                    technical_score += 2
                    reasoning_parts.append("Price above both SMA20 and SMA50 (bullish trend)")
                elif current_price > sma_20:
                    technical_score += 1
                    reasoning_parts.append("Price above SMA20 (short-term bullish)")
                elif current_price < sma_20 < sma_50:
                    technical_score -= 2
                    reasoning_parts.append("Price below both SMAs (bearish trend)")
                elif current_price < sma_20:
                    technical_score -= 1
                    reasoning_parts.append("Price below SMA20 (short-term bearish)")
                
                total_weight += 2
            
            # 2. RSI Analysis
            rsi = technical_indicators.get('rsi')
            if rsi:
                if rsi > 70:
                    technical_score -= 1
                    reasoning_parts.append(f"RSI overbought ({rsi:.1f})")
                elif rsi < 30:
                    technical_score += 1
                    reasoning_parts.append(f"RSI oversold ({rsi:.1f})")
                elif 40 <= rsi <= 60:
                    reasoning_parts.append(f"RSI neutral ({rsi:.1f})")
                
                total_weight += 1
            
            # 3. MACD Analysis
            macd = technical_indicators.get('macd')
            macd_signal = technical_indicators.get('macd_signal')
            macd_hist = technical_indicators.get('macd_histogram')
            
            if macd and macd_signal and macd_hist:
                if macd > macd_signal and macd_hist > 0:
                    technical_score += 1.5
                    reasoning_parts.append("MACD bullish crossover")
                elif macd < macd_signal and macd_hist < 0:
                    technical_score -= 1.5
                    reasoning_parts.append("MACD bearish crossover")
                
                total_weight += 1.5
            
            # 4. Bollinger Bands Analysis
            bb_percent = technical_indicators.get('bb_percent')
            if bb_percent:
                if bb_percent > 0.8:
                    technical_score -= 0.5
                    reasoning_parts.append("Price near upper Bollinger Band (potential resistance)")
                elif bb_percent < 0.2:
                    technical_score += 0.5
                    reasoning_parts.append("Price near lower Bollinger Band (potential support)")
                
                total_weight += 0.5
            
            # 5. Volume Analysis
            volume_ratio = technical_indicators.get('volume_ratio')
            if volume_ratio:
                if volume_ratio > 1.5:
                    # High volume can confirm the direction
                    if technical_score > 0:
                        technical_score += 0.5
                        reasoning_parts.append("High volume confirms bullish momentum")
                    elif technical_score < 0:
                        technical_score -= 0.5
                        reasoning_parts.append("High volume confirms bearish momentum")
                
                total_weight += 0.5
            
            # 6. Sentiment Analysis
            if sentiment_score is not None:
                sentiment_weight = abs(sentiment_score) * 2  # Weight based on sentiment strength
                total_weight += sentiment_weight
                
                if sentiment_score > 0.2:
                    technical_score += sentiment_score * 2
                    reasoning_parts.append(f"Positive sentiment ({sentiment_score:.2f})")
                elif sentiment_score < -0.2:
                    technical_score += sentiment_score * 2  # This will subtract since sentiment is negative
                    reasoning_parts.append(f"Negative sentiment ({sentiment_score:.2f})")
                else:
                    reasoning_parts.append(f"Neutral sentiment ({sentiment_score:.2f})")
            
            # Calculate final signal
            if total_weight > 0:
                normalized_score = technical_score / total_weight
            else:
                normalized_score = 0
            
            # Determine signal and confidence
            if normalized_score > 0.3:
                signal = "buy"
                confidence = min(abs(normalized_score), 1.0)
            elif normalized_score < -0.3:
                signal = "sell"
                confidence = min(abs(normalized_score), 1.0)
            else:
                signal = "hold"
                confidence = 1 - abs(normalized_score)  # Higher confidence for stronger hold signal
            
            # Generate reasoning
            reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Insufficient data for analysis"
            
            return {
                'signal': signal,
                'confidence': round(confidence, 3),
                'technical_score': round(technical_score, 3),
                'normalized_score': round(normalized_score, 3),
                'reasoning': reasoning,
                'indicators_used': list(technical_indicators.keys()),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating signal: {e}")
            return {
                'signal': 'hold',
                'confidence': 0.0,
                'technical_score': 0.0,
                'normalized_score': 0.0,
                'reasoning': f"Error in signal generation: {str(e)}",
                'indicators_used': [],
                'timestamp': datetime.now().isoformat()
            }
    
    def backtest_strategy(
        self,
        historical_data: List[Dict],
        lookback_period: int = 30
    ) -> Dict[str, Any]:
        """Backtest the trading strategy on historical data"""
        try:
            df = pd.DataFrame(historical_data)
            df = df.sort_values('timestamp')
            
            if len(df) < lookback_period + 10:
                return {"error": "Insufficient data for backtesting"}
            
            signals = []
            portfolio_value = 10000  # Starting with $10,000
            position = 0  # Shares held
            cash = portfolio_value
            trades = []
            
            for i in range(lookback_period, len(df)):
                # Get data for indicator calculation
                lookback_data = df.iloc[i-lookback_period:i].to_dict('records')
                current_price = df.iloc[i]['close']
                
                # Calculate indicators
                indicators = self.calculate_indicators(lookback_data)
                
                # Generate signal
                signal_data = self.generate_signal(
                    symbol="BACKTEST",
                    current_price=current_price,
                    technical_indicators=indicators
                )
                
                signal = signal_data['signal']
                signals.append(signal)
                
                # Execute trades based on signal
                if signal == 'buy' and cash >= current_price:
                    shares_to_buy = cash // current_price
                    if shares_to_buy > 0:
                        position += shares_to_buy
                        cash -= shares_to_buy * current_price
                        trades.append({
                            'type': 'buy',
                            'price': current_price,
                            'shares': shares_to_buy,
                            'date': df.iloc[i]['timestamp']
                        })
                
                elif signal == 'sell' and position > 0:
                    cash += position * current_price
                    trades.append({
                        'type': 'sell',
                        'price': current_price,
                        'shares': position,
                        'date': df.iloc[i]['timestamp']
                    })
                    position = 0
                
                # Calculate current portfolio value
                current_portfolio_value = cash + (position * current_price)
            
            # Final portfolio value
            final_price = df.iloc[-1]['close']
            final_portfolio_value = cash + (position * final_price)
            
            # Calculate performance metrics
            total_return = (final_portfolio_value - portfolio_value) / portfolio_value
            
            # Buy and hold comparison
            buy_hold_return = (final_price - df.iloc[lookback_period]['close']) / df.iloc[lookback_period]['close']
            
            return {
                'initial_value': portfolio_value,
                'final_value': round(final_portfolio_value, 2),
                'total_return': round(total_return * 100, 2),  # Percentage
                'buy_hold_return': round(buy_hold_return * 100, 2),
                'outperformance': round((total_return - buy_hold_return) * 100, 2),
                'total_trades': len(trades),
                'trades': trades[-10:],  # Last 10 trades
                'signal_distribution': {
                    'buy': signals.count('buy'),
                    'sell': signals.count('sell'),
                    'hold': signals.count('hold')
                }
            }
            
        except Exception as e:
            logger.error(f"Error in backtesting: {e}")
            return {"error": f"Backtesting failed: {str(e)}"}