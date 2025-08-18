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

## 🤝 Contributing

1. Fork the repository
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