from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import List, Dict
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Scheduler Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
SENTIMENT_SERVICE_URL = os.getenv("SENTIMENT_SERVICE_URL", "http://localhost:8001")
TRADING_SERVICE_URL = os.getenv("TRADING_SERVICE_URL", "http://localhost:8002")
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "your-news-api-key")

# Initialize scheduler
scheduler = AsyncIOScheduler()

class SchedulerService:
    def __init__(self):
        self.watched_symbols = ["AAPL", "TSLA", "MSFT", "NVDA", "GOOGL"]
        self.last_news_fetch = datetime.now()
        
    async def fetch_latest_news(self) -> List[Dict]:
        """Fetch latest financial news"""
        try:
            # Mock news data - replace with real news API
            mock_news = [
                {
                    "headline": f"Strong earnings report for {symbol} exceeds expectations",
                    "summary": f"{symbol} reported quarterly earnings that beat analyst forecasts.",
                    "source": "Financial Times",
                    "timestamp": datetime.now().isoformat(),
                    "symbols": [symbol]
                }
                for symbol in self.watched_symbols[:2]  # Limit for demo
            ]
            
            logger.info(f"Fetched {len(mock_news)} news articles")
            return mock_news
            
        except Exception as e:
            logger.error(f"Error fetching news: {str(e)}")
            return []
    
    async def analyze_news_sentiment(self, news_articles: List[Dict]) -> List[Dict]:
        """Analyze sentiment of news articles"""
        try:
            if not news_articles:
                return []
                
            # Prepare batch sentiment analysis request
            texts = [article["headline"] + " " + article["summary"] for article in news_articles]
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{SENTIMENT_SERVICE_URL}/sentiment/batch",
                    json={"texts": texts}
                ) as response:
                    if response.status == 200:
                        sentiment_results = await response.json()
                        
                        # Combine news with sentiment
                        for i, article in enumerate(news_articles):
                            if i < len(sentiment_results["results"]):
                                sentiment = sentiment_results["results"][i]
                                article["sentiment_score"] = sentiment["sentiment_score"]
                                article["sentiment_label"] = sentiment["label"]
                                article["confidence"] = sentiment["confidence"]
                        
                        logger.info(f"Analyzed sentiment for {len(news_articles)} articles")
                        return news_articles
                    else:
                        logger.error(f"Sentiment service error: {response.status}")
                        return news_articles
                        
        except Exception as e:
            logger.error(f"Error analyzing news sentiment: {str(e)}")
            return news_articles
    
    async def generate_trading_signals(self) -> List[Dict]:
        """Generate trading signals for watched symbols"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{TRADING_SERVICE_URL}/trading/signals",
                    json={"symbols": self.watched_symbols}
                ) as response:
                    if response.status == 200:
                        signals = await response.json()
                        logger.info(f"Generated {len(signals)} trading signals")
                        return signals
                    else:
                        logger.error(f"Trading service error: {response.status}")
                        return []
                        
        except Exception as e:
            logger.error(f"Error generating trading signals: {str(e)}")
            return []
    
    async def process_trading_signals(self, signals: List[Dict]):
        """Process trading signals and execute trades if conditions are met"""
        try:
            executed_trades = []
            
            for signal in signals:
                # Only execute high-confidence buy/sell signals
                if signal["confidence"] > 0.75 and signal["action"] in ["buy", "sell"]:
                    # Calculate position size based on confidence and risk management
                    base_quantity = 100
                    quantity = int(base_quantity * signal["confidence"])
                    
                    # Execute trade (mock execution for demo)
                    trade_result = {
                        "signal": signal,
                        "quantity": quantity,
                        "executed_at": datetime.now().isoformat(),
                        "status": "executed"
                    }
                    
                    executed_trades.append(trade_result)
                    logger.info(f"Executed {signal['action']} order for {quantity} shares of {signal['symbol']}")
            
            if executed_trades:
                logger.info(f"Executed {len(executed_trades)} trades")
            
            return executed_trades
            
        except Exception as e:
            logger.error(f"Error processing trading signals: {str(e)}")
            return []

# Initialize scheduler service
scheduler_service = SchedulerService()

# Scheduled tasks
async def news_and_sentiment_job():
    """Scheduled job to fetch news and analyze sentiment"""
    logger.info("Starting news and sentiment analysis job")
    
    # Fetch latest news
    news_articles = await scheduler_service.fetch_latest_news()
    
    # Analyze sentiment
    if news_articles:
        analyzed_news = await scheduler_service.analyze_news_sentiment(news_articles)
        
        # Store results (in production, save to database)
        logger.info(f"Completed sentiment analysis for {len(analyzed_news)} articles")

async def trading_signals_job():
    """Scheduled job to generate and process trading signals"""
    logger.info("Starting trading signals job")
    
    # Generate trading signals
    signals = await scheduler_service.generate_trading_signals()
    
    # Process signals and execute trades
    if signals:
        executed_trades = await scheduler_service.process_trading_signals(signals)
        logger.info(f"Trading signals job completed. Executed {len(executed_trades)} trades")

async def market_data_job():
    """Scheduled job to update market data cache"""
    logger.info("Starting market data update job")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{TRADING_SERVICE_URL}/trading/market-data",
                json={"symbols": scheduler_service.watched_symbols}
            ) as response:
                if response.status == 200:
                    market_data = await response.json()
                    logger.info(f"Updated market data for {len(market_data)} symbols")
                else:
                    logger.error(f"Market data update failed: {response.status}")
                    
    except Exception as e:
        logger.error(f"Error updating market data: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Start the scheduler when the app starts"""
    
    # Schedule news and sentiment analysis every 15 minutes
    scheduler.add_job(
        news_and_sentiment_job,
        CronTrigger(minute="*/15"),
        id="news_sentiment_job",
        replace_existing=True
    )
    
    # Schedule trading signals generation every 5 minutes during market hours
    scheduler.add_job(
        trading_signals_job,
        CronTrigger(minute="*/5", hour="9-16", day_of_week="0-4"),  # Weekdays 9 AM - 4 PM
        id="trading_signals_job",
        replace_existing=True
    )
    
    # Schedule market data updates every minute during market hours
    scheduler.add_job(
        market_data_job,
        CronTrigger(minute="*", hour="9-16", day_of_week="0-4"),
        id="market_data_job",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started with all jobs configured")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop the scheduler when the app shuts down"""
    scheduler.shutdown()
    logger.info("Scheduler stopped")

@app.get("/")
async def root():
    return {"message": "Scheduler Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "scheduler_running": scheduler.running,
        "jobs": [
            {
                "id": job.id,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None
            }
            for job in scheduler.get_jobs()
        ]
    }

@app.get("/jobs")
async def get_jobs():
    """Get information about scheduled jobs"""
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        })
    return {"jobs": jobs}

@app.post("/jobs/run/{job_id}")
async def run_job_now(job_id: str, background_tasks: BackgroundTasks):
    """Manually trigger a job"""
    try:
        job = scheduler.get_job(job_id)
        if not job:
            return {"error": f"Job {job_id} not found"}
        
        # Run job in background
        if job_id == "news_sentiment_job":
            background_tasks.add_task(news_and_sentiment_job)
        elif job_id == "trading_signals_job":
            background_tasks.add_task(trading_signals_job)
        elif job_id == "market_data_job":
            background_tasks.add_task(market_data_job)
        
        return {"message": f"Job {job_id} triggered successfully"}
        
    except Exception as e:
        logger.error(f"Error running job {job_id}: {str(e)}")
        return {"error": f"Failed to run job: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)