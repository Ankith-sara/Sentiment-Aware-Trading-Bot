# Sentiment-Aware Trading Bot Dashboard

A production-grade AI-powered trading assistant that combines real-time market data, sentiment analysis, and technical indicators to generate intelligent trading signals.

## 🚀 Features

### Core Functionality
- **Real-time Market Data**: Live stock prices, volume, and technical indicators
- **AI Sentiment Analysis**: FinBERT-powered news sentiment analysis
- **Trading Signals**: BUY/SELL/HOLD recommendations with confidence scores
- **Portfolio Management**: Paper trading simulation with performance tracking
- **AI Chatbot**: GPT-powered assistant for trading advice and market insights

### Advanced Features
- **Technical Analysis**: RSI, MACD, Bollinger Bands, Moving Averages
- **News Integration**: Real-time financial news with sentiment scoring
- **Backtesting Engine**: Historical strategy performance analysis
- **Risk Management**: Stop-loss, take-profit, and position sizing
- **Alert System**: Email, push, and Telegram notifications
- **Responsive Design**: Optimized for desktop and mobile trading

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Canvas API** for charts
- **WebSocket** for real-time updates

### Backend (Integration Ready)
- **FastAPI** with Python
- **Hugging Face Transformers** (FinBERT, DistilBERT)
- **OpenAI GPT** for chatbot
- **Alpaca Markets API** for trading
- **NewsAPI** for financial news
- **MongoDB/PostgreSQL** for data storage

## 🏗 Architecture

```
Frontend (React)
├── Real-time Dashboard
├── AI Chat Assistant  
├── News & Sentiment Analysis
├── Portfolio Management
└── Configuration Panel

Backend Services (FastAPI)
├── DataFetcher Service
├── SentimentAnalyzer Service  
├── TechnicalAnalyzer Service
├── PortfolioManager Service
├── ChatBot Service
└── AlertManager Service

Data Sources
├── Alpaca Markets API
├── NewsAPI / Polygon.io
├── Hugging Face Models
└── OpenAI GPT API
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+ (for backend)
- API keys for data sources

### Frontend Setup
```bash
npm install
npm run dev
```

### Environment Configuration
Copy `.env.example` to `.env` and configure your API keys:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_NEWS_API_KEY=your_news_api_key
VITE_ALPACA_API_KEY=your_alpaca_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HUGGINGFACE_API_KEY=your_hf_key
```

## 🔧 Backend Integration

### FastAPI Services Structure
```python
# main.py - FastAPI application
# services/
#   ├── data_fetcher.py      # Market data & news
#   ├── sentiment_analyzer.py # FinBERT sentiment analysis  
#   ├── technical_analyzer.py # Technical indicators
#   ├── portfolio_manager.py  # Portfolio tracking
#   ├── chatbot.py           # GPT-powered assistant
#   └── alert_manager.py     # Notification system
```

### Key API Endpoints
- `GET /api/market-data/{symbol}` - Real-time price data
- `GET /api/news/{symbol}` - Financial news with sentiment
- `POST /api/signals/generate` - Generate trading signals
- `POST /api/chat` - Gemini AI chatbot interaction
- `GET /api/portfolio` - Portfolio status
- `POST /api/backtest` - Run strategy backtests

## 🤖 AI Models Integration

### Sentiment Analysis
```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# FinBERT for financial sentiment
model_name = "ProsusAI/finbert"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
```

### Gemini AI Chatbot Integration
```python
import google.generativeai as genai

# Gemini Pro for conversational AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def generate_trading_advice(user_query, market_context):
    prompt = f"Trading Context: {market_context}\nUser Question: {user_query}"
    response = model.generate_content(prompt)
    return response.text
```

## 📊 Data Flow

1. **Data Ingestion**: Fetch market data and news every 5 minutes
2. **Sentiment Analysis**: Process news through FinBERT model
3. **Technical Analysis**: Calculate indicators from price data
4. **Signal Generation**: Combine sentiment + technical scores
5. **Portfolio Update**: Track positions and performance
6. **User Interface**: Display real-time updates via WebSocket

## 🔐 Security Features

- API key encryption and secure storage
- Rate limiting and request validation
- User authentication with JWT tokens
- Paper trading mode for safe testing
- Audit logging for all trades

## 📈 Performance Optimization

- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized queries for historical data
- **WebSocket**: Real-time updates without polling
- **Lazy Loading**: Component-based code splitting
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Docker Configuration
```dockerfile
# Frontend
FROM node:18-alpine
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Backend  
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes Deployment
- Horizontal Pod Autoscaling
- Load balancing across multiple instances
- Health checks and monitoring
- Secrets management for API keys

## 🔮 Future Roadmap

### Phase 2: Advanced AI
- **Reinforcement Learning**: Self-optimizing trading strategies
- **Multi-Asset Support**: Crypto, forex, commodities
- **Social Sentiment**: Reddit, Twitter sentiment integration
- **Risk Advisor**: AI-powered risk assessment

### Phase 3: Enterprise Features
- **Multi-User Support**: Team collaboration features
- **Advanced Analytics**: Custom dashboards and reports
- **API Marketplace**: Third-party strategy integrations
- **Institutional Tools**: Large portfolio management

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For questions and support:
- 📧 Email: support@sentimentbot.pro
- 💬 Discord: [Join our community](https://discord.gg/sentimentbot)
- 📖 Documentation: [docs.sentimentbot.pro](https://docs.sentimentbot.pro)