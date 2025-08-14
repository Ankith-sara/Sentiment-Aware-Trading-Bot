import aiohttp
import asyncio
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class NewsFetcher:
    def __init__(self):
        self.finnhub_api_key = os.getenv('FINNHUB_API_KEY')
        self.session = None
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
    
    async def get_news(self, symbol: str, limit: int = 10) -> List[Dict]:
        """
        Fetch latest news for a given symbol
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL')
            limit: Number of news articles to fetch
            
        Returns:
            List of news articles with metadata
        """
        try:
            session = await self._get_session()
            
            # Calculate date range (last 7 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
            
            # Format dates for API
            from_date = start_date.strftime('%Y-%m-%d')
            to_date = end_date.strftime('%Y-%m-%d')
            
            # Finnhub company news endpoint
            url = f"https://finnhub.io/api/v1/company-news"
            params = {
                'symbol': symbol,
                'from': from_date,
                'to': to_date,
                'token': self.finnhub_api_key
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    news_data = await response.json()
                    
                    # Process and format news data
                    processed_news = []
                    for item in news_data[:limit]:  # Limit results
                        if item.get('headline') and item.get('datetime'):
                            processed_item = {
                                'id': item.get('id', hash(item['headline'])),
                                'headline': item['headline'],
                                'summary': item.get('summary', ''),
                                'url': item.get('url', ''),
                                'source': item.get('source', 'Unknown'),
                                'published_at': datetime.fromtimestamp(
                                    item['datetime']
                                ).isoformat(),
                                'symbol': symbol,
                                'category': item.get('category', ''),
                                'image': item.get('image', '')
                            }
                            processed_news.append(processed_item)
                    
                    logger.info(f"Fetched {len(processed_news)} news articles for {symbol}")
                    return processed_news
                    
                else:
                    logger.error(f"API request failed with status {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {e}")
            return []
    
    async def get_general_news(self, category: str = 'general', limit: int = 20) -> List[Dict]:
        """
        Fetch general market news
        
        Args:
            category: News category ('general', 'forex', 'crypto', 'merger')
            limit: Number of articles to fetch
            
        Returns:
            List of news articles
        """
        try:
            session = await self._get_session()
            
            url = f"https://finnhub.io/api/v1/news"
            params = {
                'category': category,
                'token': self.finnhub_api_key
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    news_data = await response.json()
                    
                    processed_news = []
                    for item in news_data[:limit]:
                        if item.get('headline') and item.get('datetime'):
                            processed_item = {
                                'id': item.get('id', hash(item['headline'])),
                                'headline': item['headline'],
                                'summary': item.get('summary', ''),
                                'url': item.get('url', ''),
                                'source': item.get('source', 'Unknown'),
                                'published_at': datetime.fromtimestamp(
                                    item['datetime']
                                ).isoformat(),
                                'category': category,
                                'image': item.get('image', '')
                            }
                            processed_news.append(processed_item)
                    
                    return processed_news
                    
                else:
                    logger.error(f"General news API request failed with status {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching general news: {e}")
            return []
    
    async def search_news(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for news articles by keyword
        
        Args:
            query: Search query
            limit: Number of results to return
            
        Returns:
            List of matching news articles
        """
        # For now, we'll use general news and filter
        # In production, you might want to use a dedicated news search API
        try:
            general_news = await self.get_general_news(limit=50)
            
            # Simple keyword matching
            query_lower = query.lower()
            matching_news = [
                article for article in general_news
                if query_lower in article['headline'].lower() or 
                   query_lower in article.get('summary', '').lower()
            ]
            
            return matching_news[:limit]
            
        except Exception as e:
            logger.error(f"Error searching news: {e}")
            return []

# Example usage and testing
async def main():
    fetcher = NewsFetcher()
    
    try:
        # Test fetching news for AAPL
        news = await fetcher.get_news('AAPL', limit=5)
        print(f"Found {len(news)} articles for AAPL")
        
        for article in news[:2]:  # Print first 2
            print(f"\nHeadline: {article['headline']}")
            print(f"Source: {article['source']}")
            print(f"Published: {article['published_at']}")
        
    finally:
        await fetcher.close_session()

if __name__ == "__main__":
    asyncio.run(main())