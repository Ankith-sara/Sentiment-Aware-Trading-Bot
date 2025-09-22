import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewsItem, TradeSignal, Portfolio } from '../types/trading';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  async generateResponse(
    userMessage: string,
    context: {
      symbol: string;
      portfolio: Portfolio;
      recentTrades: TradeSignal[];
      recentNews: NewsItem[];
      marketSentiment: number;
    }
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    const systemPrompt = `You are an expert AI trading assistant with deep knowledge of financial markets, technical analysis, and sentiment analysis. You help users make informed trading decisions by analyzing market data, news sentiment, and technical indicators.

Current Market Context:
- Primary Symbol: ${context.symbol}
- Portfolio Value: $${context.portfolio.totalValue.toLocaleString()}
- Daily P&L: ${context.portfolio.dailyPnL >= 0 ? '+' : ''}$${context.portfolio.dailyPnL.toFixed(2)}
 Portfolio Value: ₹${context.portfolio.totalValue.toLocaleString('en-IN')}
 Daily P&L: ${context.portfolio.dailyPnL >= 0 ? '+' : ''}₹${context.portfolio.dailyPnL.toFixed(2)}
- Overall Market Sentiment: ${context.marketSentiment.toFixed(3)} (${context.marketSentiment > 0.2 ? 'Bullish' : context.marketSentiment < -0.2 ? 'Bearish' : 'Neutral'})
- Recent Trades: ${context.recentTrades.length} signals generated
- Latest News: ${context.recentNews.length} articles analyzed

Recent Trading Signals:
${context.recentTrades.map(trade => 
  `- ${trade.signal} ${trade.symbol} at ₹${trade.price.toFixed(2)} (Confidence: ${(trade.confidence * 100).toFixed(0)}%, Sentiment: ${trade.sentimentScore.toFixed(2)})`
).join('\n')}

Recent News Headlines:
${context.recentNews.map(news => 
  `- ${news.title} (Sentiment: ${news.sentiment.toFixed(2)} - ${news.sentimentLabel})`
).join('\n')}

Portfolio Positions:
${context.portfolio.positions.map(pos => 
  `- ${pos.symbol}: ${pos.quantity} shares at ₹${pos.currentPrice.toFixed(2)} (P&L: ${pos.unrealizedPnL >= 0 ? '+' : ''}₹${pos.unrealizedPnL.toFixed(2)})`
).join('\n')}

Guidelines:
1. Focus on Indian stock market (NSE/BSE) context and regulations
2. Provide specific, actionable trading advice based on the data
3. Explain your reasoning using both sentiment and technical analysis
4. Consider risk management and portfolio diversification
5. Use professional trading terminology but keep explanations clear
6. Reference specific data points from the context when relevant
7. Consider Indian market timings (9:15 AM - 3:30 PM IST)
8. Be concise but comprehensive in your analysis
9. Always include risk disclaimers when appropriate
10. Use INR currency format and Indian stock symbols

User Question: ${userMessage}

Please provide a detailed, professional response that addresses the user's question while incorporating the current market context and data.`;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate AI response. Please check your API key and try again.');
    }
  }

  async analyzeMarketConditions(
    symbol: string,
    priceData: any[],
    newsData: NewsItem[]
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key not configured.');
    }

    const prompt = `Analyze the current market conditions for ${symbol} based on the following data:

Price Data (last 10 points):
${priceData.slice(-10).map(p => `${new Date(p.timestamp).toLocaleTimeString()}: $${p.price.toFixed(2)} (Sentiment: ${p.sentiment.toFixed(2)})`).join('\n')}

Recent News:
${newsData.slice(0, 5).map(n => `- ${n.title} (${n.sentimentLabel}: ${n.sentiment.toFixed(2)})`).join('\n')}

Provide a comprehensive market analysis including:
1. Current trend direction and strength
2. Key support and resistance levels
3. Sentiment analysis summary
4. Risk factors to watch
5. Trading recommendations with specific entry/exit points

Keep the analysis professional and actionable for traders.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Market analysis error:', error);
      throw new Error('Failed to analyze market conditions.');
    }
  }

  async explainTradingSignal(signal: TradeSignal, context: any): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key not configured.');
    }

    const prompt = `Explain this trading signal in detail:

Signal: ${signal.signal} ${signal.symbol} at $${signal.price.toFixed(2)}
Signal: ${signal.signal} ${signal.symbol} at ₹${signal.price.toFixed(2)}
Confidence: ${(signal.confidence * 100).toFixed(0)}%
Sentiment Score: ${signal.sentimentScore.toFixed(3)}
Technical Score: ${signal.technicalScore.toFixed(3)}
Combined Score: ${signal.combinedScore.toFixed(3)}
Risk Level: ${signal.riskLevel}
Reason: ${signal.reason}

Please provide:
1. Detailed explanation of why this signal was generated
2. Risk assessment and position sizing recommendations
3. Entry and exit strategy suggestions
4. What to watch for that might invalidate this signal
5. Alternative scenarios and contingency plans

Make it educational and actionable for both novice and experienced traders.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Signal explanation error:', error);
      throw new Error('Failed to explain trading signal.');
    }
  }
}

export const aiService = new AIService();