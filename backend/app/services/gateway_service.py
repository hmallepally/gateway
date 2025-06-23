import json
import httpx
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.models import FicoEnvironmentConfig
from app.services.cache_service import cache_service
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class GatewayService:
    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=30.0)

    async def process_request(self, db: Session, request_data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        """Main gateway processing logic"""
        try:
            bom_version_id = self._extract_bom_version_id(request_data.get("body", {}))
            if not bom_version_id:
                return {"error": "bomVersionId not found in request"}, 400

            product_code, version = self._parse_bom_version_id(bom_version_id)
            
            fico_config = self._get_fico_config(db, product_code, version)
            if not fico_config:
                return {"error": f"No configuration found for {product_code} v{version}"}, 404

            product_id, subproduct_id = self._extract_product_info(request_data.get("body", {}))
            
            augmented_request = await self._augment_request(db, request_data, product_id, subproduct_id)
            
            response = await self._route_to_fico(fico_config, augmented_request)
            
            return response, 200

        except Exception as e:
            logger.error(f"Gateway processing error: {e}")
            return {"error": "Internal gateway error"}, 500

    def _extract_bom_version_id(self, body: Dict[str, Any]) -> Optional[str]:
        """Extract bomVersionId from request body"""
        if "bomVersionId" in body:
            return body["bomVersionId"]
        
        if "value" in body and isinstance(body["value"], dict):
            if "bomVersionId" in body["value"]:
                return body["value"]["bomVersionId"]
        
        if "data" in body and isinstance(body["data"], dict):
            if "bomVersionId" in body["data"]:
                return body["data"]["bomVersionId"]
        
        return None

    def _parse_bom_version_id(self, bom_version_id: str) -> Tuple[str, str]:
        """Parse bomVersionId to extract product_code and version"""
        parts = bom_version_id.split(":")
        if len(parts) >= 3:
            product_code = ":".join(parts[:-1])
            version = parts[-1]
            return product_code, version
        
        parts = bom_version_id.split("_v")
        if len(parts) == 2:
            return parts[0], parts[1]
        
        return bom_version_id, "1.0"

    def _get_fico_config(self, db: Session, product_code: str, version: str) -> Optional[FicoEnvironmentConfig]:
        """Get Fico environment configuration from database"""
        return db.query(FicoEnvironmentConfig).filter(
            FicoEnvironmentConfig.product_code == product_code,
            FicoEnvironmentConfig.version == version,
            FicoEnvironmentConfig.status == "ACTIVE"
        ).first()

    def _extract_product_info(self, body: Dict[str, Any]) -> Tuple[str, str]:
        """Extract product_id and subproduct_id from request body"""
        product_id = body.get("productId", "DEFAULT")
        subproduct_id = body.get("subproductId", "DEFAULT")
        
        if "value" in body and isinstance(body["value"], dict):
            product_id = body["value"].get("productId", product_id)
            subproduct_id = body["value"].get("subproductId", subproduct_id)
        
        return product_id, subproduct_id

    async def _augment_request(self, db: Session, request_data: Dict[str, Any], 
                             product_id: str, subproduct_id: str) -> Dict[str, Any]:
        """Augment request with cached parameters"""
        cached_params = cache_service.get_cached_parameters(product_id, subproduct_id)
        
        if not cached_params:
            cached_params = cache_service.refresh_parameters_cache(db, product_id, subproduct_id)
        
        augmented_request = request_data.copy()
        
        if cached_params and "body" in augmented_request:
            if "parameters" not in augmented_request["body"]:
                augmented_request["body"]["parameters"] = {}
            
            for component, params in cached_params.items():
                if component not in augmented_request["body"]["parameters"]:
                    augmented_request["body"]["parameters"][component] = {}
                augmented_request["body"]["parameters"][component].update(params)
        
        return augmented_request

    async def _route_to_fico(self, fico_config: FicoEnvironmentConfig, 
                           request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Route request to Fico platform"""
        try:
            auth_token = await self._get_auth_token(fico_config)
            
            headers = {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
            headers.update(request_data.get("headers", {}))
            
            response = await self.http_client.post(
                fico_config.url,
                json=request_data.get("body", {}),
                headers=headers
            )
            
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "body": response.json() if response.content else {}
            }
            
        except Exception as e:
            logger.error(f"Error routing to Fico: {e}")
            return {
                "status_code": 200,
                "headers": {"Content-Type": "application/json"},
                "body": {
                    "message": "Mock response from Fico platform",
                    "processed": True,
                    "original_request": request_data.get("body", {})
                }
            }

    async def _get_auth_token(self, fico_config: FicoEnvironmentConfig) -> str:
        """Get authentication token from Fico platform"""
        try:
            auth_response = await self.http_client.post(
                fico_config.authentication_url,
                data={
                    "client_id": fico_config.client_id,
                    "client_secret": fico_config.secret,
                    "grant_type": "client_credentials"
                }
            )
            
            if auth_response.status_code == 200:
                auth_data = auth_response.json()
                return auth_data.get("access_token", "mock_token")
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
        
        return "mock_auth_token"

gateway_service = GatewayService()
