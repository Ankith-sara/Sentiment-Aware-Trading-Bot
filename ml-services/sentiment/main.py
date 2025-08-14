from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

from sentiment_analyzer import SentimentAnalyzer
from data_fetcher import NewsFetcher
from cache_manager import CacheManager

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sentiment Analysis Service",
    description="AI-powered financial sentiment analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
sentiment_analyzer = SentimentAnalyzer()
news_fetcher = NewsFetcher()
cache_manager = CacheManager()

# Pydantic models
class TextInput(BaseModel):
    text: str
    symbol: Optional[str] = None

class BatchTextInput(BaseModel):
    texts: List[str]
    symbol: Optional[str] = None

class SentimentResponse(BaseModel):
    text: str
    sentiment_score: float  # -1 to 1
    confidence: float
    label: str  # 'positive', 'negative', 'neutral'
    timestamp: str

class NewsAnalysisRequest(BaseModel):
    symbol: str
    limit: int = 10

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": sentiment_analyzer.is_loaded
    }

@app.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(input_data: TextInput):
    """Analyze sentiment of a single text"""
    try:
        # Check cache first
        cache_key = f"sentiment:{hash(input_data.text)}"
        cached_result = await cache_manager.get(cache_key)
        
        if cached_result:
            return SentimentResponse(**cached_result)
        
        # Analyze sentiment
        result = sentiment_analyzer.analyze(input_data.text)
        
        response = SentimentResponse(
            text=input_data.text,
            sentiment_score=result['score'],
            confidence=result['confidence'],
            label=result['label'],
            timestamp=datetime.now().isoformat()
        )
        
        # Cache result for 1 hour
        await cache_manager.set(cache_key, response.dict(), expire=3600)
        
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        raise HTTPException(status_code=500, detail="Sentiment analysis failed")

@app.post("/analyze/batch")
async def analyze_batch_sentiment(input_data: BatchTextInput):
    """Analyze sentiment of multiple texts"""
    try:
        results = []
        
        for text in input_data.texts:
            # Check cache first
            cache_key = f"sentiment:{hash(text)}"
            cached_result = await cache_manager.get(cache_key)
            
            if cached_result:
                results.append(SentimentResponse(**cached_result))
            else:
                # Analyze sentiment
                result = sentiment_analyzer.analyze(text)
                
                response = SentimentResponse(
                    text=text,
                    sentiment_score=result['score'],
                    confidence=result['confidence'],
                    label=result['label'],
                    timestamp=datetime.now().isoformat()
                )
                
                # Cache result
                await cache_manager.set(cache_key, response.dict(), expire=3600)
                results.append(response)
        
        return {"results": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"Error in batch sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail="Batch sentiment analysis failed")

@app.post("/analyze/news")
async def analyze_news_sentiment(
    request: NewsAnalysisRequest,
    background_tasks: BackgroundTasks
):
    """Fetch and analyze news sentiment for a symbol"""
    try:
        # Fetch latest news
        news_articles = await news_fetcher.get_news(
            symbol=request.symbol,
            limit=request.limit
        )
        
        if not news_articles:
            return {"message": "No news found", "results": []}
        
        results = []
        
        for article in news_articles:
            # Analyze headline and content
            headline_sentiment = sentiment_analyzer.analyze(article['headline'])
            
            content_sentiment = None
            if article.get('content'):
                content_sentiment = sentiment_analyzer.analyze(article['content'][:500])  # First 500 chars
            
            # Calculate combined sentiment (weight headline more)
            combined_score = headline_sentiment['score']
            if content_sentiment:
                combined_score = (headline_sentiment['score'] * 0.7 + 
                                content_sentiment['score'] * 0.3)
            
            result = {
                "article_id": article.get('id'),
                "headline": article['headline'],
                "url": article.get('url'),
                "published_at": article.get('published_at'),
                "source": article.get('source'),
                "headline_sentiment": {
                    "score": headline_sentiment['score'],
                    "confidence": headline_sentiment['confidence'],
                    "label": headline_sentiment['label']
                },
                "content_sentiment": content_sentiment,
                "combined_sentiment": {
                    "score": combined_score,
                    "label": "positive" if combined_score > 0.1 else "negative" if combined_score < -0.1 else "neutral"
                }
            }
            
            results.append(result)
        
        # Calculate overall sentiment for the symbol
        if results:
            overall_score = sum(r['combined_sentiment']['score'] for r in results) / len(results)
            overall_label = "positive" if overall_score > 0.1 else "negative" if overall_score < -0.1 else "neutral"
        else:
            overall_score = 0
            overall_label = "neutral"
        
        # Store in cache and database (background task)
        background_tasks.add_task(
            store_sentiment_results,
            request.symbol,
            results,
            overall_score
        )
        
        return {
            "symbol": request.symbol,
            "overall_sentiment": {
                "score": overall_score,
                "label": overall_label,
                "confidence": sum(r['headline_sentiment']['confidence'] for r in results) / len(results) if results else 0
            },
            "articles_analyzed": len(results),
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing news sentiment: {e}")
        raise HTTPException(status_code=500, detail="News sentiment analysis failed")

async def store_sentiment_results(symbol: str, results: List[dict], overall_score: float):
    """Background task to store sentiment results"""
    try:
        # Store in Redis for quick access
        cache_key = f"news_sentiment:{symbol}"
        await cache_manager.set(cache_key, {
            "overall_score": overall_score,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }, expire=1800)  # 30 minutes
        
        logger.info(f"Stored sentiment results for {symbol}")
        
    except Exception as e:
        logger.error(f"Error storing sentiment results: {e}")

@app.get("/sentiment/{symbol}")
async def get_cached_sentiment(symbol: str):
    """Get cached sentiment data for a symbol"""
    try:
        cache_key = f"news_sentiment:{symbol}"
        cached_data = await cache_manager.get(cache_key)
        
        if cached_data:
            return cached_data
        else:
            raise HTTPException(status_code=404, detail="No cached sentiment data found")
            
    except Exception as e:
        logger.error(f"Error retrieving cached sentiment: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sentiment data")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        reload=True,
        log_level="info"
    )