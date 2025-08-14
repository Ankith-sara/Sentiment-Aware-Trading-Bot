import logging
from typing import Dict, Any
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

class RiskManager:
    def __init__(self):
        self.max_position_size = 0.1  # 10% of portfolio
        self.max_daily_loss = 0.05    # 5% max daily loss
        self.max_drawdown = 0.2       # 20% max drawdown
        self.min_liquidity = 1000     # Minimum daily volume
        
        # Risk levels based on various factors
        self.volatility_thresholds = {
            'low': 0.02,     # 2% daily volatility
            'medium': 0.05,  # 5% daily volatility
            'high': 0.10     # 10% daily volatility
        }
    
    def assess_risk(
        self,
        symbol: str,
        signal: str,
        confidence: float,
        market_data: Dict[str, Any]
    ) -> str:
        """Assess risk level for a trading signal"""
        try:
            risk_score = 0
            
            # 1. Volatility risk
            if 'change_percent' in market_data:
                abs_change = abs(market_data['change_percent'])
                if abs_change > self.volatility_thresholds['high'] * 100:
                    risk_score += 3
                elif abs_change > self.volatility_thresholds['medium'] * 100:
                    risk_score += 2
                else:
                    risk_score += 1
            
            # 2. Confidence risk (lower confidence = higher risk)
            if confidence < 0.3:
                risk_score += 3
            elif confidence < 0.6:
                risk_score += 2
            else:
                risk_score += 1
            
            # 3. Price level risk (stocks near 52-week highs/lows)
            if 'high' in market_data and 'low' in market_data and 'price' in market_data:
                price = market_data['price']
                high = market_data['high']
                low = market_data['low']
                
                if high > 0 and low > 0:
                    price_position = (price - low) / (high - low)
                    
                    # Higher risk at extremes
                    if price_position > 0.9 or price_position < 0.1:
                        risk_score += 2
                    else:
                        risk_score += 1
            
            # Determine risk level
            if risk_score >= 7:
                return 'high'
            elif risk_score >= 4:
                return 'medium'
            else:
                return 'low'
                
        except Exception as e:
            logger.error(f"Error assessing risk: {e}")
            return 'high'  # Default to high risk if error
    
    def validate_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        user_id: int,
        current_portfolio: Dict = None
    ) -> Dict[str, Any]:
        """Validate if an order should be executed based on risk rules"""
        try:
            # Basic validation
            if quantity <= 0:
                return {
                    'approved': False,
                    'reason': 'Invalid quantity'
                }
            
            # Position size validation
            if current_portfolio:
                portfolio_value = current_portfolio.get('account', {}).get('portfolio_value', 0)
                
                if portfolio_value > 0:
                    order_value = quantity * self._estimate_price(symbol)
                    position_percentage = order_value / portfolio_value
                    
                    if position_percentage > self.max_position_size:
                        return {
                            'approved': False,
                            'reason': f'Order exceeds maximum position size ({self.max_position_size * 100}%)'
                        }
            
            # Market hours validation (simplified)
            current_hour = datetime.now().hour
            if current_hour < 9 or current_hour > 16:  # Basic market hours check
                return {
                    'approved': False,
                    'reason': 'Market is closed'
                }
            
            # Additional risk checks could be added here:
            # - Daily trading limits
            # - Sector concentration limits
            # - Correlation limits
            # - News event blackouts
            
            return {
                'approved': True,
                'reason': 'Order validated successfully'
            }
            
        except Exception as e:
            logger.error(f"Error validating order: {e}")
            return {
                'approved': False,
                'reason': 'Risk validation failed'
            }
    
    def _estimate_price(self, symbol: str) -> float:
        """Estimate current price for position sizing (placeholder)"""
        # In a real implementation, this would fetch current market data
        return 100.0  # Placeholder value
    
    def calculate_position_size(
        self,
        signal_confidence: float,
        risk_level: str,
        portfolio_value: float,
        volatility: float = None
    ) -> float:
        """Calculate optimal position size based on risk parameters"""
        try:
            # Base position size as percentage of portfolio
            base_size = 0.05  # 5% base
            
            # Adjust based on confidence
            confidence_multiplier = signal_confidence
            
            # Adjust based on risk level
            risk_multipliers = {
                'low': 1.5,
                'medium': 1.0,
                'high': 0.5
            }
            risk_multiplier = risk_multipliers.get(risk_level, 0.5)
            
            # Adjust based on volatility if available
            volatility_multiplier = 1.0
            if volatility:
                if volatility > 0.05:  # High volatility
                    volatility_multiplier = 0.7
                elif volatility < 0.02:  # Low volatility
                    volatility_multiplier = 1.3
            
            # Calculate final position size
            position_percentage = (
                base_size * 
                confidence_multiplier * 
                risk_multiplier * 
                volatility_multiplier
            )
            
            # Cap at maximum position size
            position_percentage = min(position_percentage, self.max_position_size)
            
            return position_percentage * portfolio_value
            
        except Exception as e:
            logger.error(f"Error calculating position size: {e}")
            return portfolio_value * 0.01  # Conservative 1% fallback
    
    def check_portfolio_risk(self, portfolio: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall portfolio risk"""
        try:
            risk_metrics = {
                'overall_risk': 'medium',
                'diversification_score': 0.5,
                'concentration_risk': 'low',
                'sector_exposure': {},
                'recommendations': []
            }
            
            if not portfolio or 'positions' not in portfolio:
                return risk_metrics
            
            positions = portfolio['positions']
            total_value = portfolio.get('account', {}).get('portfolio_value', 0)
            
            if not positions or total_value == 0:
                return risk_metrics
            
            # Calculate concentration risk
            position_percentages = []
            for position in positions:
                position_value = abs(float(position.get('market_value', 0)))
                percentage = position_value / total_value if total_value > 0 else 0
                position_percentages.append(percentage)
            
            # Check for concentration
            max_position = max(position_percentages) if position_percentages else 0
            
            if max_position > 0.3:  # 30%
                risk_metrics['concentration_risk'] = 'high'
                risk_metrics['recommendations'].append('Consider reducing largest position')
            elif max_position > 0.15:  # 15%
                risk_metrics['concentration_risk'] = 'medium'
            
            # Calculate diversification (simplified Herfindahl index)
            if position_percentages:
                hhi = sum(p**2 for p in position_percentages)
                diversification_score = 1 - hhi
                risk_metrics['diversification_score'] = round(diversification_score, 3)
                
                if diversification_score < 0.3:
                    risk_metrics['recommendations'].append('Portfolio lacks diversification')
            
            # Overall risk assessment
            num_positions = len(positions)
            if num_positions < 3:
                risk_metrics['overall_risk'] = 'high'
                risk_metrics['recommendations'].append('Increase diversification with more positions')
            elif max_position > 0.2 or diversification_score < 0.4:
                risk_metrics['overall_risk'] = 'medium'
            else:
                risk_metrics['overall_risk'] = 'low'
            
            return risk_metrics
            
        except Exception as e:
            logger.error(f"Error checking portfolio risk: {e}")
            return {
                'overall_risk': 'high',
                'error': str(e),
                'recommendations': ['Unable to assess risk - review portfolio manually']
            }