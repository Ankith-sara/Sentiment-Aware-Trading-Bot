import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingUp, AlertCircle, Lightbulb, Zap, Brain } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';
import { ChatMessage } from '../types/trading';
import { aiService } from '../services/aiService';

export const ChatAssistant: React.FC = () => {
  const { chatMessages, addChatMessage, selectedSymbol, trades, news, portfolio } = useTrading();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const generateAdvancedAIResponse = async (userMessage: string): Promise<string> => {
    // Use real Gemini AI for responses
    try {
      const context = {
        symbol: selectedSymbol,
        portfolio: portfolio,
        recentTrades: trades.slice(0, 5),
        recentNews: news.slice(0, 3),
        marketSentiment: news.reduce((sum, item) => sum + item.sentiment, 0) / news.length,
      };
      
      return await aiService.generateResponse(userMessage, context);
    } catch (error) {
      console.error('AI service error:', error);
      return `I apologize, but I'm having trouble connecting to the AI service. ${error instanceof Error ? error.message : 'Please check your Gemini API configuration and try again.'}

To set up the AI assistant:
1. Get a Gemini API key from Google AI Studio
2. Add VITE_GEMINI_API_KEY to your .env file
3. Restart the development server

In the meantime, I can still help with basic market data analysis based on the current information displayed in your dashboard.`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing with realistic delay
    setTimeout(async () => {
      try {
        const responseContent = await generateAdvancedAIResponse(inputMessage);
        const aiResponse: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          type: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
          context: {
            symbol: selectedSymbol,
            news: news.slice(0, 3),
          }
        };

        addChatMessage(aiResponse);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          type: 'assistant',
          content: error instanceof Error ? error.message : 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment.',
          timestamp: new Date().toISOString(),
        };
        addChatMessage(errorMessage);
      } finally {
        setIsTyping(false);
      }
    }, 1500 + Math.random() * 1000); // Realistic AI response time
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Why is AAPL a buy today?",
    "What's the best stock right now?",
    "How is my portfolio performing?",
    "What's driving market sentiment?",
    "Should I take profits on GOOGL?",
    "What's your risk management strategy?",
    "Explain the current market conditions",
    "How do you analyze sentiment?"
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Trading Assistant
            </h2>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            <span>Real-time Analysis</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 min-h-0">
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Welcome to your AI Trading Assistant
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              I'm powered by Google's Gemini AI and analyze real-time market sentiment, technical indicators, and news to provide intelligent trading insights. Ask me anything about your portfolio, market conditions, or trading strategies.
            </p>
            
            <div className="space-y-2 max-w-lg mx-auto">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Popular questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-blue-100 dark:bg-blue-900' 
                : 'bg-gradient-to-br from-emerald-500 to-blue-600'
            }`}>
              {message.type === 'user' ? (
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`flex-1 max-w-[85%] ${
              message.type === 'user' ? 'text-right' : ''
            }`}>
              <div className={`inline-block p-3 lg:p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about trading signals, market sentiment, or strategy advice..."
            className="flex-1 px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 lg:px-6 py-2 lg:py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Lightbulb className="w-3 h-3" />
            <span>AI-powered insights</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Real-time analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Brain className="w-3 h-3" />
            <span>Gemini AI + FinBERT</span>
          </div>
        </div>
      </div>
    </div>
  );
};