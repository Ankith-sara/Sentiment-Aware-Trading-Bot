import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from urllib.parse import quote
import feedparser
import json

from app.core.config import settings
from app.schemas.trading import NewsItem, NewsItemCreate
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.news_api_key = settings.NEWS_API_KEY
        self.base_urls = {
            'newsapi': 'https://newsapi.org/v2',
            'financial_modeling': 'https://financialmodelingprep.com/api/v3',
            'alpha_vantage': 'https://www.alphavantage.co/query'
        }
        self.indian_sources = [
            'business-standard',
            'the-times-of-india',
            'the-hindu',
            'economic-times'
        ]
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_session(self):
        """Get or create aiohttp session"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def fetch_news(
        self, 
        symbol: Optional[str] = None,
        limit: int = 20,
        hours_back: int = 24
    ) -> List[NewsItem]:
        """Fetch news from multiple sources"""
        try:
            all_news = []
            
            # Fetch from different sources
            if self.news_api_key:
                newsapi_results = await self._fetch_from_newsapi(symbol, limit, hours_back)
                all_news.extend(newsapi_results)
            
            # Fetch from RSS feeds
            rss_results = await self._fetch_from_rss(symbol, limit)
            all_news.extend(rss_results)
            
            # Fetch Indian financial news
            indian_results = await self._fetch_indian_financial_news(symbol, limit)
            all_news.extend(indian_results)
            
            # Remove duplicates and sort by date
            unique_news = self._deduplicate_news(all_news)
            sorted_news = sorted(unique_news, key=lambda x: x.published_at, reverse=True)
            
            # Limit results
            limited_news = sorted_news[:limit]
            
            # Analyze sentiment for all news
            await self._analyze_news_sentiment(limited_news)
            
            return limited_news
            
        except Exception as e:
            logger.error(f"Failed to fetch news: {e}")
            return []
    
    async def _fetch_from_newsapi(
        self, 
        symbol: Optional[str], 
        limit: int, 
        hours_back: int
    ) -> List[NewsItem]:
        """Fetch news from NewsAPI.org"""
        try:
            session = await self.get_session()
            
            # Build query
            if symbol:
                # Map common symbols to company names for better results
                company_names = self._get_company_names(symbol)
                query = f"{symbol} OR {' OR '.join(company_names)}"
            else:
                query = "India stock market OR Indian shares OR NSE OR BSE"
            
            # Calculate date range
            from_date = (datetime.now() - timedelta(hours=hours_back)).strftime('%Y-%m-%d')
            
            params = {
                'q': query,
                'language': 'en',
                'sortBy': 'publishedAt',
                'from': from_date,
                'pageSize': min(limit, 100),
                'apiKey': self.news_api_key
            }
            
            # Add Indian sources if no specific symbol
            if not symbol:
                params['sources'] = ','.join(self.indian_sources)
            
            url = f"{self.base_urls['newsapi']}/everything"
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    articles = data.get('articles', [])
                    
                    news_items = []
                    for article in articles:
                        try:
                            news_item = NewsItem(
                                title=article.get('title', ''),
                                content=article.get('content', ''),
                                summary=article.get('description', ''),
                                url=article.get('url', ''),
                                source=article.get('source', {}).get('name', 'NewsAPI'),
                                author=article.get('author', ''),
                                published_at=self._parse_datetime(article.get('publishedAt')),
                                sentiment=0.0,
                                sentiment_label='neutral',
                                sentiment_confidence=0.0,
                                symbols=self._extract_symbols_from_content(article.get('content', '') + ' ' + article.get('title', '')),
                                categories=['financial'],
                                created_at=datetime.now()
                            )
                            news_items.append(news_item)
                        except Exception as e:
                            logger.warning(f"Failed to parse news article: {e}")
                            continue
                    
                    return news_items
                else:
                    logger.error(f"NewsAPI error: {response.status}")
                    
        except Exception as e:
            logger.error(f"NewsAPI fetch failed: {e}")
        
        return []
    
    async def _fetch_from_rss(self, symbol: Optional[str], limit: int) -> List[NewsItem]:
        """Fetch news from RSS feeds"""
        try:
            rss_feeds = [
                'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
                'https://www.business-standard.com/rss/markets-106.rss',
                'https://www.moneycontrol.com/rss/results.xml',
                'https://feeds.feedburner.com/ndtvprofit-latest',
                'https://www.livemint.com/rss/markets'
            ]
            
            all_news = []
            session = await self.get_session()
            
            for feed_url in rss_feeds:
                try:
                    async with session.get(feed_url, timeout=10) as response:
                        if response.status == 200:
                            content = await response.text()
                            feed = feedparser.parse(content)
                            
                            for entry in feed.entries[:limit//len(rss_feeds)]:
                                try:
                                    # Filter by symbol if specified
                                    if symbol and not self._content_matches_symbol(entry.title + ' ' + entry.get('summary', ''), symbol):
                                        continue
                                    
                                    news_item = NewsItem(
                                        title=entry.title,
                                        content=entry.get('summary', ''),
                                        summary=entry.get('summary', '')[:200] + '...' if len(entry.get('summary', '')) > 200 else entry.get('summary', ''),
                                        url=entry.link,
                                        source=feed.feed.get('title', 'RSS Feed'),
                                        author=entry.get('author', ''),
                                        published_at=self._parse_datetime(entry.get('published')),
                                        sentiment=0.0,
                                        sentiment_label='neutral',
                                        sentiment_confidence=0.0,
                                        symbols=self._extract_symbols_from_content(entry.title + ' ' + entry.get('summary', '')),
                                        categories=['financial'],
                                        created_at=datetime.now()
                                    )
                                    all_news.append(news_item)
                                    
                                except Exception as e:
                                    logger.warning(f"Failed to parse RSS entry: {e}")
                                    continue
                                    
                except Exception as e:
                    logger.warning(f"Failed to fetch RSS feed {feed_url}: {e}")
                    continue
            
            return all_news
            
        except Exception as e:
            logger.error(f"RSS fetch failed: {e}")
            return []
    
    async def _fetch_indian_financial_news(self, symbol: Optional[str], limit: int) -> List[NewsItem]:
        """Fetch news from Indian financial websites"""
        try:
            # Custom scraping for Indian financial news sites
            # This is a simplified version - in production, you'd want more robust scraping
            
            session = await self.get_session()
            news_items = []
            
            # Money Control news
            if symbol:
                search_url = f"https://www.moneycontrol.com/news/tags/{symbol.lower()}.html"
            else:
                search_url = "https://www.moneycontrol.com/news/business/markets/"
            
            try:
                # Note: In production, you'd implement proper web scraping here
                # For now, we'll return mock data
                mock_news = self._get_mock_indian_news(symbol)
                news_items.extend(mock_news)
                
            except Exception as e:
                logger.warning(f"Failed to fetch from MoneyControl: {e}")
            
            return news_items[:limit]
            
        except Exception as e:
            logger.error(f"Indian financial news fetch failed: {e}")
            return []
    
    def _get_mock_indian_news(self, symbol: Optional[str]) -> List[NewsItem]:
        """Get mock Indian financial news for testing"""
        mock_articles = [
            {
                'title': f"{symbol or 'NIFTY'} shows strong momentum in early trading session",
                'content': f"The stock {symbol or 'market'} demonstrated robust performance in today's trading session with increased investor confidence.",
                'source': 'MoneyControl',
                'published_at': datetime.now() - timedelta(hours=2)
            },
            {
                'title': f"Market Analysis: {symbol or 'Indian stocks'} outlook remains positive",
                'content': f"Technical analysis suggests {symbol or 'the broader market'} may continue its upward trajectory based on recent patterns.",
                'source': 'Economic Times',
                'published_at': datetime.now() - timedelta(hours=4)
            },
            {
                'title': f"Institutional investors show renewed interest in {symbol or 'Indian equities'}",
                'content': f"Foreign institutional investors have increased their stake in {symbol or 'Indian markets'} signaling confidence.",
                'source': 'Business Standard',
                'published_at': datetime.now() - timedelta(hours=6)
            }
        ]
        
        news_items = []
        for article in mock_articles:
            news_item = NewsItem(
                title=article['title'],
                content=article['content'],
                summary=article['content'][:100] + '...',
                url=f"https://example.com/news/{hash(article['title'])}",
                source=article['source'],
                author='Market Reporter',
                published_at=article['published_at'],
                sentiment=0.0,
                sentiment_label='neutral',
                sentiment_confidence=0.0,
                symbols=[symbol] if symbol else ['NIFTY'],
                categories=['financial', 'indian-market'],
                created_at=datetime.now()
            )
            news_items.append(news_item)
        
        return news_items
    
    async def _analyze_news_sentiment(self, news_items: List[NewsItem]):
        """Analyze sentiment for news items"""
        try:
            # Prepare texts for batch analysis
            texts = []
            for item in news_items:
                # Combine title and content for better sentiment analysis
                text = f"{item.title}. {item.content or item.summary or ''}"
                texts.append(text)
            
            # Batch analyze sentiment
            sentiment_results = await ai_service.analyze_batch_sentiment(texts)
            
            # Update news items with sentiment
            for i, (item, sentiment) in enumerate(zip(news_items, sentiment_results)):
                item.sentiment = sentiment.score
                item.sentiment_label = sentiment.label
                item.sentiment_confidence = sentiment.confidence
                
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            # Set default neutral sentiment
            for item in news_items:
                item.sentiment = 0.0
                item.sentiment_label = 'neutral'
                item.sentiment_confidence = 0.0
    
    def _deduplicate_news(self, news_items: List[NewsItem]) -> List[NewsItem]:
        """Remove duplicate news articles"""
        seen_urls = set()
        seen_titles = set()
        unique_items = []
        
        for item in news_items:
            # Check for duplicates by URL or similar titles
            if item.url in seen_urls:
                continue
                
            # Simple title similarity check
            title_words = set(item.title.lower().split())
            is_similar = False
            
            for seen_title in seen_titles:
                seen_words = set(seen_title.lower().split())
                # If more than 70% words are common, consider it duplicate
                common_ratio = len(title_words & seen_words) / len(title_words | seen_words)
                if common_ratio > 0.7:
                    is_similar = True
                    break
            
            if not is_similar:
                seen_urls.add(item.url)
                seen_titles.add(item.title)
                unique_items.append(item)
        
        return unique_items
    
    def _parse_datetime(self, date_str: Optional[str]) -> datetime:
        """Parse datetime string from various formats"""
        if not date_str:
            return datetime.now()
        
        try:
            # Try common formats
            formats = [
                '%Y-%m-%dT%H:%M:%SZ',
                '%Y-%m-%dT%H:%M:%S.%fZ',
                '%a, %d %b %Y %H:%M:%S %Z',
                '%a, %d %b %Y %H:%M:%S %z',
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d'
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            # If no format matches, return current time
            logger.warning(f"Could not parse date: {date_str}")
            return datetime.now()
            
        except Exception as e:
            logger.warning(f"Date parsing error: {e}")
            return datetime.now()
    
    def _extract_symbols_from_content(self, content: str) -> List[str]:
        """Extract stock symbols from news content"""
        import re
        
        # Common Indian stock symbols pattern
        symbol_pattern = r'\b[A-Z]{2,10}\b'
        
        # Known Indian symbols
        indian_symbols = {
            'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'KOTAKBANK',
            'HINDUNILVR', 'ITC', 'LT', 'SBIN', 'BAJFINANCE', 'BHARTIARTL',
            'ASIANPAINT', 'MARUTI', 'AXISBANK', 'TITAN', 'WIPRO', 'ULTRACEMCO',
            'NESTLEIND', 'POWERGRID', 'NTPC', 'COALINDIA', 'HCLTECH', 'DRREDDY',
            'SUNPHARMA', 'JSWSTEEL', 'TATAMOTORS', 'INDUSINDBK', 'BAJAJFINSV',
            'CIPLA', 'TECHM', 'GRASIM', 'ADANIENT', 'EICHERMOT', 'BPCL',
            'DIVISLAB', 'BRITANNIA', 'APOLLOHOSP', 'TATASTEEL', 'HEROMOTOCO',
            'BAJAJ-AUTO', 'TATACONSUM', 'SHREECEM', 'UPL', 'HINDALCO'
        }
        
        # Find potential symbols
        potential_symbols = set(re.findall(symbol_pattern, content.upper()))
        
        # Filter to known symbols
        valid_symbols = [symbol for symbol in potential_symbols if symbol in indian_symbols]
        
        return valid_symbols
    
    def _content_matches_symbol(self, content: str, symbol: str) -> bool:
        """Check if content is relevant to the symbol"""
        content_upper = content.upper()
        
        # Direct symbol match
        if symbol.upper() in content_upper:
            return True
        
        # Company name match
        company_names = self._get_company_names(symbol)
        for name in company_names:
            if name.upper() in content_upper:
                return True
        
        return False
    
    def _get_company_names(self, symbol: str) -> List[str]:
        """Get company names for a symbol"""
        # Mapping of symbols to company names
        symbol_to_name = {
            'RELIANCE': ['Reliance Industries', 'RIL'],
            'TCS': ['Tata Consultancy Services', 'TCS'],
            'HDFCBANK': ['HDFC Bank', 'HDFC'],
            'INFY': ['Infosys', 'Infosys Limited'],
            'ICICIBANK': ['ICICI Bank', 'ICICI'],
            'ITC': ['ITC Limited', 'Indian Tobacco Company'],
            'BHARTIARTL': ['Bharti Airtel', 'Airtel'],
            'KOTAKBANK': ['Kotak Mahindra Bank', 'Kotak Bank'],
            'LT': ['Larsen & Toubro', 'L&T'],
            'SBIN': ['State Bank of India', 'SBI'],
            'MARUTI': ['Maruti Suzuki', 'Maruti'],
            'BAJFINANCE': ['Bajaj Finance', 'Bajaj Finserv'],
            'ASIANPAINT': ['Asian Paints', 'Asian Paint'],
            'WIPRO': ['Wipro Limited', 'Wipro'],
            'TITAN': ['Titan Company', 'Titan'],
            'HINDUNILVR': ['Hindustan Unilever', 'HUL'],
            'AXISBANK': ['Axis Bank', 'Axis'],
            'NESTLEIND': ['Nestle India', 'Nestle'],
            'ULTRACEMCO': ['UltraTech Cement', 'UltraTech'],
            'POWERGRID': ['Power Grid Corporation', 'PowerGrid'],
            'NTPC': ['NTPC Limited', 'National Thermal Power'],
            'COALINDIA': ['Coal India', 'CIL'],
            'HCLTECH': ['HCL Technologies', 'HCL Tech'],
            'DRREDDY': ['Dr Reddy\'s Laboratories', 'Dr Reddy'],
            'SUNPHARMA': ['Sun Pharmaceutical', 'Sun Pharma'],
            'JSWSTEEL': ['JSW Steel', 'JSW'],
            'TATAMOTORS': ['Tata Motors', 'Tata Motor'],
            'INDUSINDBK': ['IndusInd Bank', 'IndusInd'],
            'BAJAJFINSV': ['Bajaj Finserv', 'Bajaj Financial'],
            'CIPLA': ['Cipla Limited', 'Cipla'],
            'TECHM': ['Tech Mahindra', 'TechM'],
            'GRASIM': ['Grasim Industries', 'Grasim'],
            'ADANIENT': ['Adani Enterprises', 'Adani Group'],
            'EICHERMOT': ['Eicher Motors', 'Royal Enfield'],
            'BPCL': ['Bharat Petroleum', 'BPCL'],
            'DIVISLAB': ['Divi\'s Laboratories', 'Divi Labs'],
            'BRITANNIA': ['Britannia Industries', 'Britannia'],
            'APOLLOHOSP': ['Apollo Hospitals', 'Apollo'],
            'TATASTEEL': ['Tata Steel', 'Tata Steel Limited'],
            'HEROMOTOCO': ['Hero MotoCorp', 'Hero Motors']
        }
        
        return symbol_to_name.get(symbol.upper(), [symbol])
    
    async def close(self):
        """Close the service"""
        if self.session:
            await self.session.close()

# Global news service instance
news_service = NewsService()