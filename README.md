<<<<<<< HEAD
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
=======
# Sentiment-Aware Trading Bot

A sophisticated trading bot that combines sentiment analysis with technical indicators to make intelligent trading decisions. Built with React.js frontend and Python FastAPI microservices.

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│          Client Layer (React.js)     │
│ - Dashboard with real-time charts    │
│ - User authentication (Firebase)     │
│ - Light/Dark mode support           │
│ - Real-time updates via WebSocket    │
└──────────────────┬───────────────────┘
                   │ REST / WebSocket
┌──────────────────┴───────────────────┐
│       Python Microservices          │
│ - Sentiment Analysis (FinBERT)      │
│ - Trading Engine (Alpaca API)       │
│ - Scheduler Service (APScheduler)   │
│ - Market Data Integration            │
└──────────────────┬───────────────────┘
                   │
┌──────────────────┴───────────────────┐
│       Database & Storage Layer       │
│ - PostgreSQL (trades, configs)      │
│ - Redis (cache sentiment scores)    │
└───────────────────────────────────────┘
```

## 🚀 Features

### Frontend (React.js)
- **Authentication**: Firebase Auth with Google Sign-In
- **Theme Support**: Light and Dark mode toggle
- **Real-time Dashboard**: Live price charts and sentiment analysis
- **Trading Interface**: Execute trades with confidence scores
- **News Feed**: Sentiment-tagged financial news
- **Portfolio Management**: Track performance and history

### Backend Microservices (Python FastAPI)

#### 1. Sentiment Analysis Service (`port 8001`)
- **FinBERT Integration**: Financial-tuned BERT model
- **Batch Processing**: Analyze multiple texts efficiently
- **Real-time API**: REST endpoints for sentiment scoring
- **Confidence Scoring**: Reliability metrics for predictions

#### 2. Trading Engine Service (`port 8002`)
- **Multi-source Data**: Alpaca, Finnhub, Polygon.io integration
- **Signal Generation**: Combines sentiment + technical analysis
- **Risk Management**: Position sizing and stop-loss logic
- **Trade Execution**: Automated order placement

#### 3. Scheduler Service (`port 8003`)
- **Automated Jobs**: Cron-based task scheduling
- **News Monitoring**: Periodic news fetching and analysis
- **Signal Processing**: Regular trading signal generation
- **Market Data Updates**: Real-time price data synchronization

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Firebase Account
- Trading API Keys (Alpaca, Finnhub)

### 1. Clone Repository
```bash
git clone <repository-url>
cd sentiment-trading-bot
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Configure Firebase
cp .env.example .env
# Edit .env with your Firebase configuration
```

### 3. Python Services Setup
```bash
# Install Python dependencies for each service
cd python-services/sentiment-service
pip install -r requirements.txt

cd ../trading-service
pip install -r requirements.txt

cd ../scheduler-service
pip install -r requirements.txt
```

### 4. Docker Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication with Email/Password and Google
3. Copy configuration to `.env` file

### Trading APIs
1. **Alpaca**: Get API keys from [Alpaca Markets](https://alpaca.markets/)
2. **Finnhub**: Register at [Finnhub.io](https://finnhub.io/)
3. Add keys to `.env` file

### Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit with your actual values
nano .env
```

## 📊 API Endpoints

### Sentiment Service (Port 8001)
- `POST /sentiment/analyze` - Single text analysis
- `POST /sentiment/batch` - Batch text analysis
- `GET /health` - Service health check

### Trading Service (Port 8002)
- `POST /trading/signals` - Generate trading signals
- `POST /trading/market-data` - Get market data
- `POST /trading/execute` - Execute trades
- `GET /health` - Service health check

### Scheduler Service (Port 8003)
- `GET /jobs` - List scheduled jobs
- `POST /jobs/run/{job_id}` - Manually trigger job
- `GET /health` - Service health check

## 🔄 Development Workflow

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

### Python Services Development
```bash
# Run individual services
cd python-services/sentiment-service
uvicorn main:app --reload --port 8001

cd python-services/trading-service
uvicorn main:app --reload --port 8002

cd python-services/scheduler-service
uvicorn main:app --reload --port 8003
```

## 📈 Trading Strategy

The bot uses a hybrid approach combining:

1. **Sentiment Analysis** (70% weight)
   - FinBERT model for financial text analysis
   - News headline and summary processing
   - Social media sentiment (future enhancement)

2. **Technical Analysis** (30% weight)
   - RSI indicators
   - Moving averages
   - Volume analysis
   - Price momentum

3. **Risk Management**
   - Position sizing based on confidence
   - Stop-loss and take-profit levels
   - Maximum daily loss limits
   - Portfolio diversification

## 🔒 Security Features

- **Firebase Authentication**: Secure user management
- **API Key Encryption**: Secure storage of trading credentials
- **CORS Protection**: Proper cross-origin request handling
- **Input Validation**: Pydantic models for API validation
- **Rate Limiting**: Protection against API abuse

## 📱 Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Mobile trading interface
- **Progressive Web App**: Installable on mobile devices
- **Offline Support**: Cached data for offline viewing

## 🧪 Testing

```bash
# Frontend tests
npm test

# Python service tests
cd python-services/sentiment-service
pytest

cd ../trading-service
pytest

cd ../scheduler-service
pytest
```

## 🚀 Deployment

### Production Deployment
1. **Frontend**: Deploy to Vercel/Netlify
2. **Backend**: Deploy to AWS ECS/Fargate or Google Cloud Run
3. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
4. **Cache**: Use managed Redis (AWS ElastiCache, Google Memorystore)

### Environment-Specific Configs
- **Development**: Local Docker containers
- **Staging**: Cloud services with test data
- **Production**: Fully managed cloud infrastructure

## 📊 Monitoring & Analytics

- **Service Health**: Built-in health check endpoints
- **Performance Metrics**: Response time and throughput monitoring
- **Trading Analytics**: P&L tracking and performance metrics
- **Error Logging**: Comprehensive error tracking and alerting
>>>>>>> e055dc2ea80f786ab36bf8b1a974db61f91ca2a2

## 🤝 Contributing

1. Fork the repository
<<<<<<< HEAD
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For questions and support:
- 📧 Email: support@sentimentbot.pro
- 💬 Discord: [Join our community](https://discord.gg/sentimentbot)
- 📖 Documentation: [docs.sentimentbot.pro](https://docs.sentimentbot.pro)
=======
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints
- Test with the health check endpoints

## 🔮 Future Enhancements

- **Machine Learning**: Advanced ML models for prediction
- **Social Media**: Twitter/Reddit sentiment integration
- **Options Trading**: Support for options strategies
- **Backtesting**: Historical strategy testing
- **Mobile App**: Native iOS/Android applications
- **Multi-Exchange**: Support for multiple trading platforms
>>>>>>> e055dc2ea80f786ab36bf8b1a974db61f91ca2a2
