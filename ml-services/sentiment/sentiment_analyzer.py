import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import logging
from typing import Dict
import re

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self, model_name: str = "ProsusAI/finbert"):
        """
        Initialize the sentiment analyzer with a financial BERT model
        
        Args:
            model_name: HuggingFace model name (default: FinBERT)
        """
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.pipeline = None
        self.is_loaded = False
        
        self._load_model()
    
    def _load_model(self):
        """Load the sentiment analysis model"""
        try:
            logger.info(f"Loading model: {self.model_name}")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            
            # Create pipeline
            self.pipeline = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                return_all_scores=True
            )
            
            self.is_loaded = True
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.is_loaded = False
            raise
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for sentiment analysis"""
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\!\?,-]', '', text)
        
        return text.strip()
    
    def _convert_to_score(self, results: list) -> Dict[str, float]:
        """
        Convert model output to standardized score format
        
        Returns:
            Dict with 'score' (-1 to 1), 'confidence', and 'label'
        """
        # FinBERT returns: positive, negative, neutral
        label_mapping = {
            'LABEL_0': 'negative',  # or 'negative'
            'LABEL_1': 'neutral',   # or 'neutral' 
            'LABEL_2': 'positive',  # or 'positive'
            'negative': 'negative',
            'neutral': 'neutral',
            'positive': 'positive'
        }
        
        # Find the highest confidence prediction
        best_result = max(results, key=lambda x: x['score'])
        label = label_mapping.get(best_result['label'].lower(), best_result['label'])
        confidence = best_result['score']
        
        # Convert to -1 to 1 scale
        if label == 'positive':
            score = confidence  # 0 to 1
        elif label == 'negative':
            score = -confidence  # -1 to 0
        else:  # neutral
            score = 0.0
        
        return {
            'score': score,
            'confidence': confidence,
            'label': label
        }
    
    def analyze(self, text: str) -> Dict[str, float]:
        """
        Analyze sentiment of given text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dict with sentiment score, confidence, and label
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        if not text or not text.strip():
            return {
                'score': 0.0,
                'confidence': 1.0,
                'label': 'neutral'
            }
        
        try:
            # Preprocess text
            clean_text = self._preprocess_text(text)
            
            # Truncate if too long (BERT has 512 token limit)
            if len(clean_text) > 400:  # Conservative limit
                clean_text = clean_text[:400] + "..."
            
            # Get sentiment scores
            results = self.pipeline(clean_text)
            
            # Convert to standardized format
            return self._convert_to_score(results[0] if isinstance(results[0], list) else results)
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            # Return neutral sentiment on error
            return {
                'score': 0.0,
                'confidence': 0.0,
                'label': 'neutral'
            }
    
    def analyze_batch(self, texts: list) -> list:
        """
        Analyze sentiment for multiple texts
        
        Args:
            texts: List of texts to analyze
            
        Returns:
            List of sentiment analysis results
        """
        results = []
        
        for text in texts:
            results.append(self.analyze(text))
        
        return results
    