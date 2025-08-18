from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import logging
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sentiment Analysis Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load FinBERT model for financial sentiment analysis
MODEL_NAME = "ProsusAI/finbert"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

# Create sentiment analysis pipeline
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model=model,
    tokenizer=tokenizer,
    device=0 if torch.cuda.is_available() else -1
)

class SentimentRequest(BaseModel):
    text: str
    source: Optional[str] = None

class SentimentResponse(BaseModel):
    sentiment_score: float
    confidence: float
    label: str
    processing_time: float

class BatchSentimentRequest(BaseModel):
    texts: List[str]
    sources: Optional[List[str]] = None

class BatchSentimentResponse(BaseModel):
    results: List[SentimentResponse]
    total_processing_time: float

def normalize_sentiment_score(result):
    """Convert FinBERT output to normalized sentiment score (0-1)"""
    label = result['label'].lower()
    score = result['score']
    
    if label == 'positive':
        return 0.5 + (score * 0.5)  # 0.5 to 1.0
    elif label == 'negative':
        return 0.5 - (score * 0.5)  # 0.0 to 0.5
    else:  # neutral
        return 0.5  # exactly neutral

def get_sentiment_label(score: float) -> str:
    """Convert normalized score to label"""
    if score >= 0.6:
        return 'positive'
    elif score <= 0.4:
        return 'negative'
    else:
        return 'neutral'

@app.get("/")
async def root():
    return {"message": "Sentiment Analysis Service", "model": MODEL_NAME}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }

@app.post("/sentiment/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of a single text"""
    try:
        start_time = time.time()
        
        # Truncate text if too long (FinBERT has token limits)
        text = request.text[:512] if len(request.text) > 512 else request.text
        
        # Get sentiment prediction
        result = sentiment_pipeline(text)[0]
        
        # Normalize the score
        sentiment_score = normalize_sentiment_score(result)
        confidence = result['score']
        label = get_sentiment_label(sentiment_score)
        
        processing_time = time.time() - start_time
        
        logger.info(f"Analyzed sentiment for text: {text[:50]}... Score: {sentiment_score:.3f}")
        
        return SentimentResponse(
            sentiment_score=sentiment_score,
            confidence=confidence,
            label=label,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

@app.post("/sentiment/batch", response_model=BatchSentimentResponse)
async def analyze_batch_sentiment(request: BatchSentimentRequest):
    """Analyze sentiment of multiple texts in batch"""
    try:
        start_time = time.time()
        
        # Truncate texts if too long
        texts = [text[:512] if len(text) > 512 else text for text in request.texts]
        
        # Batch processing for efficiency
        results = sentiment_pipeline(texts)
        
        # Process results
        sentiment_results = []
        for i, result in enumerate(results):
            sentiment_score = normalize_sentiment_score(result)
            confidence = result['score']
            label = get_sentiment_label(sentiment_score)
            
            sentiment_results.append(SentimentResponse(
                sentiment_score=sentiment_score,
                confidence=confidence,
                label=label,
                processing_time=0.0  # Individual timing not available in batch
            ))
        
        total_processing_time = time.time() - start_time
        
        logger.info(f"Batch analyzed {len(texts)} texts in {total_processing_time:.3f}s")
        
        return BatchSentimentResponse(
            results=sentiment_results,
            total_processing_time=total_processing_time
        )
        
    except Exception as e:
        logger.error(f"Error in batch sentiment analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch sentiment analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)