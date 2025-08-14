import redis.asyncio as redis
import json
import logging
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_keepalive=True,
                socket_keepalive_options={}
            )
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    async def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        if not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting from cache: {e}")
            return None
    
    async def set(self, key: str, value: Dict[str, Any], expire: int = 3600):
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            expire: Expiration time in seconds (default: 1 hour)
        """
        if not self.redis_client:
            return
        
        try:
            await self.redis_client.setex(
                key,
                expire,
                json.dumps(value, default=str)
            )
        except Exception as e:
            logger.error(f"Error setting cache: {e}")
    
    async def delete(self, key: str):
        """Delete key from cache"""
        if not self.redis_client:
            return
        
        try:
            await self.redis_client.delete(key)
        except Exception as e:
            logger.error(f"Error deleting from cache: {e}")
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.redis_client:
            return False
        
        try:
            return await self.redis_client.exists(key)
        except Exception as e:
            logger.error(f"Error checking cache existence: {e}")
            return False
    
    async def get_many(self, keys: list) -> Dict[str, Any]:
        """Get multiple keys from cache"""
        if not self.redis_client:
            return {}
        
        try:
            values = await self.redis_client.mget(keys)
            result = {}
            
            for key, value in zip(keys, values):
                if value:
                    result[key] = json.loads(value)
            
            return result
        except Exception as e:
            logger.error(f"Error getting multiple keys from cache: {e}")
            return {}
    
    async def set_many(self, data: Dict[str, Any], expire: int = 3600):
        """Set multiple key-value pairs in cache"""
        if not self.redis_client:
            return
        
        try:
            pipe = self.redis_client.pipeline()
            
            for key, value in data.items():
                pipe.setex(key, expire, json.dumps(value, default=str))
            
            await pipe.execute()
        except Exception as e:
            logger.error(f"Error setting multiple keys in cache: {e}")
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()