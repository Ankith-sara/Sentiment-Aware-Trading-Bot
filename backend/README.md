# AI Trading Assistant Backend

A comprehensive FastAPI backend for an AI-powered trading assistant focused on the Indian stock market (NSE/BSE).

## Features

### 🤖 AI-Powered Analysis
- **Sentiment Analysis**: FinBERT and Hugging Face models for financial text analysis
- **Market Analysis**: OpenAI GPT integration for comprehensive market insights
- **Technical Analysis**: TA-Lib integration for technical indicators
- **News Processing**: Real-time news fetching and sentiment analysis

### 📊 Trading Capabilities
- **Signal Generation**: Multi-factor trading signals combining sentiment, technical, and fundamental analysis
- **Risk Management**: Dynamic position sizing and risk assessment
- **Paper Trading**: Alpaca Markets integration for safe trading simulation
- **Backtesting**: Historical strategy testing and performance analysis

### 🔄 Real-time Data
- **Market Data**: Live price feeds via Alpaca Markets and Yahoo Finance
- **News Feeds**: Multiple news sources including Indian financial news
- **Portfolio Tracking**: Real-time position and P&L monitoring
- **WebSocket Support**: Live updates for frontend applications

### 💾 Data Management
- **PostgreSQL**: Primary database for structured data
- **MongoDB**: Alternative NoSQL storage option
- **Redis**: Caching and session management
- **Automated Migrations**: Alembic database versioning

## Tech Stack

- **Framework**: FastAPI with Python 3.9+
- **AI/ML**: Hugging Face Transformers, OpenAI GPT, TA-Lib
- **Database**: PostgreSQL, MongoDB (optional), Redis
- **Trading**: Alpaca Markets API
- **News**: NewsAPI, RSS feeds, web scraping
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- API Keys (OpenAI, Alpaca, NewsAPI)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb trading_db
   
   # Run migrations
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Setup

1. **Using Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Manual Docker**
   ```bash
   docker build -t trading-backend .
   docker run -p 8000:8000 trading-backend
   ```

## API Endpoints

### Trading
- `GET /api/v1/trading/signals/{symbol}` - Get trading signals
- `POST /api/v1/trading/signals/generate` - Generate new signal
- `GET /api/v1/trading/market-data/{symbol}` - Get market data
- `POST /api/v1/trading/execute-trade` - Execute trade
- `GET /api/v1/trading/positions` - Get portfolio positions
- `POST /api/v1/trading/chat` - AI trading assistant

### Market Data
- `GET /api/v1/market-data/{symbol}` - Historical data
- `GET /api/v1/technical/{symbol}` - Technical indicators
- `GET /api/v1/current-price/{symbol}` - Real-time price

### News & Sentiment
- `GET /api/v1/news/{symbol}` - Symbol-specific news
- `GET /api/v1/news/` - General financial news
- `POST /api/v1/sentiment/analyze` - Sentiment analysis

### Portfolio
- `GET /api/v1/portfolio` - Portfolio overview
- `POST /api/v1/portfolio/execute-trade` - Execute trades
- `GET /api/v1/portfolio/performance` - Performance metrics

## Configuration

### Required API Keys

1. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - Used for: AI chat responses and market analysis

2. **Alpaca Markets API**
   - Get from: https://alpaca.markets/
   - Used for: Market data and paper trading

3. **NewsAPI Key**
   - Get from: https://newsapi.org/
   - Used for: News fetching and sentiment analysis

4. **Hugging Face API (Optional)**
   - Get from: https://huggingface.co/settings/tokens
   - Used for: Enhanced sentiment analysis models

### Environment Variables

Key configuration options in `.env`:

```bash
# Core Settings
DEBUG=False
SECRET_KEY=your-secret-key
PROJECT_NAME="Trading Assistant API"

# Database
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=trading_db

# API Keys
OPENAI_API_KEY=sk-...
ALPACA_API_KEY=...
ALPACA_SECRET_KEY=...
NEWS_API_KEY=...

# AI Settings
SENTIMENT_MODEL=ProsusAI/finbert
SENTIMENT_BATCH_SIZE=16

# Trading Settings
MAX_POSITION_SIZE=10000.0
DEFAULT_STOP_LOSS=0.05
DEFAULT_TAKE_PROFIT=0.10
```

## Database Schema

### Core Models
- **User**: User accounts and preferences
- **Portfolio**: Portfolio management and positions
- **TradeSignal**: AI-generated trading signals
- **NewsItem**: News articles with sentiment analysis
- **MarketData**: Historical price and volume data
- **ChatMessage**: AI chat conversation history

### Relationships
- Users have multiple portfolios
- Portfolios contain multiple positions
- Trade signals are linked to users
- News items are tagged with relevant symbols

## AI/ML Pipeline

### 1. Data Collection
- **Market Data**: Real-time price feeds
- **News Data**: Multi-source news aggregation
- **Technical Data**: Calculated indicators

### 2. Sentiment Analysis
- **FinBERT**: Financial domain-specific sentiment
- **Multi-model**: Ensemble approach for accuracy
- **Real-time**: Streaming sentiment updates

### 3. Signal Generation
- **Multi-factor**: Combines sentiment, technical, momentum
- **Risk Assessment**: Dynamic risk scoring
- **Confidence**: Signal confidence calculation

### 4. AI Chat
- **Context-aware**: Portfolio and market context
- **Professional**: Financial domain expertise
- **Educational**: Explanatory responses

## Deployment

### Production Setup

1. **Environment Setup**
   ```bash
   # Production environment
   export ENVIRONMENT=production
   export DEBUG=False
   ```

2. **Database Configuration**
   ```bash
   # Use production database
   export POSTGRES_SERVER=prod-db-server
   export REDIS_URL=redis://prod-redis-server:6379
   ```

3. **Security Configuration**
   ```bash
   # Strong secret key
   export SECRET_KEY=$(openssl rand -hex 32)
   
   # Allowed hosts
   export ALLOWED_HOSTS=your-domain.com,api.your-domain.com
   ```

4. **Process Management**
   ```bash
   # Using Gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Docker Production

```dockerfile
# Multi-stage build for production
FROM python:3.9-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

## Monitoring & Logging

### Structured Logging
```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
```

### Health Checks
- `GET /health` - Service health status
- Database connectivity check
- External API availability
- Redis connection status

### Metrics
- Request/response metrics
- Trading signal accuracy
- AI model performance
- Database query performance

## Testing

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/
```

### Test Structure
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **AI Tests**: Model accuracy validation
- **Trading Tests**: Signal generation validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards
- **Black**: Code formatting
- **isort**: Import organization
- **Flake8**: Linting
- **Type Hints**: Full type annotation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: Bug reports and feature requests
- Documentation: Comprehensive API documentation at `/docs`
- Community: Join our Discord server for discussions

## Roadmap

### Upcoming Features
- [ ] Advanced backtesting engine
- [ ] Options trading support
- [ ] Social sentiment analysis
- [ ] Mobile app API
- [ ] Advanced risk models
- [ ] Multi-exchange support

### Performance Improvements
- [ ] Database query optimization
- [ ] Caching strategies
- [ ] Async processing improvements
- [ ] Model inference optimization