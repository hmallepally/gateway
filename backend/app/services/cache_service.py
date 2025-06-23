import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import ConfigurableParameters
from app.database import get_redis
import logging

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_client = get_redis()
        self.cache_ttl = 3600  # 1 hour

    def get_cached_parameters(self, product_id: str, subproduct_id: str) -> Dict[str, Any]:
        """Get cached parameters for a product/subproduct combination"""
        cache_key = f"params:{product_id}:{subproduct_id}"
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for {cache_key}")
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Redis error: {e}")
        
        logger.info(f"Cache miss for {cache_key}")
        return {}

    def set_cached_parameters(self, product_id: str, subproduct_id: str, parameters: Dict[str, Any]):
        """Cache parameters for a product/subproduct combination"""
        cache_key = f"params:{product_id}:{subproduct_id}"
        
        try:
            self.redis_client.setex(
                cache_key, 
                self.cache_ttl, 
                json.dumps(parameters)
            )
            logger.info(f"Cached parameters for {cache_key}")
        except Exception as e:
            logger.error(f"Failed to cache parameters: {e}")

    def refresh_parameters_cache(self, db: Session, product_id: str, subproduct_id: str):
        """Refresh cache from database for specific product/subproduct"""
        current_time = datetime.utcnow()
        
        parameters = db.query(ConfigurableParameters).filter(
            ConfigurableParameters.product_id == product_id,
            ConfigurableParameters.subproduct_id == subproduct_id,
            ConfigurableParameters.status == "ACTIVE",
            ConfigurableParameters.effective_from <= current_time,
            (ConfigurableParameters.effective_to.is_(None) | 
             (ConfigurableParameters.effective_to >= current_time))
        ).all()
        
        param_dict = {}
        for param in parameters:
            component_key = param.component
            if component_key not in param_dict:
                param_dict[component_key] = {}
            param_dict[component_key][param.parameter] = param.value
        
        self.set_cached_parameters(product_id, subproduct_id, param_dict)
        
        return param_dict

    def invalidate_cache(self, product_id: str, subproduct_id: str):
        """Invalidate cache for specific product/subproduct"""
        cache_key = f"params:{product_id}:{subproduct_id}"
        try:
            self.redis_client.delete(cache_key)
            logger.info(f"Invalidated cache for {cache_key}")
        except Exception as e:
            logger.error(f"Failed to invalidate cache: {e}")

cache_service = CacheService()
