from fastapi import FastAPI
from typing import Dict, Any
import uvicorn
import asyncio

mock_plor_app = FastAPI(title="Mock Fico PLOR")

@mock_plor_app.post("/api/plor/process")
async def mock_plor_process(request: Dict[str, Any]):
    """Mock Fico PLOR processing endpoint"""
    return {
        "status": "success",
        "message": "Mock PLOR processing completed",
        "processed_data": request,
        "plor_response": {
            "decision": "APPROVED",
            "score": 850,
            "risk_level": "LOW"
        }
    }

@mock_plor_app.post("/oauth/token")
async def mock_plor_auth():
    """Mock PLOR authentication endpoint"""
    return {
        "access_token": "mock_plor_token_12345",
        "token_type": "bearer",
        "expires_in": 3600
    }

mock_dm_app = FastAPI(title="Mock Fico DM")

@mock_dm_app.post("/api/dm/decision")
async def mock_dm_decision(request: Dict[str, Any]):
    """Mock Fico DM decision endpoint"""
    return {
        "status": "success",
        "message": "Mock DM decision completed",
        "processed_data": request,
        "dm_response": {
            "decision": "ACCEPT",
            "confidence": 0.95,
            "reasons": ["Good credit history", "Stable income"]
        }
    }

@mock_dm_app.post("/oauth/token")
async def mock_dm_auth():
    """Mock DM authentication endpoint"""
    return {
        "access_token": "mock_dm_token_67890",
        "token_type": "bearer",
        "expires_in": 3600
    }

if __name__ == "__main__":
    async def run_mock_services():
        config_plor = uvicorn.Config(mock_plor_app, host="0.0.0.0", port=8001, log_level="info")
        config_dm = uvicorn.Config(mock_dm_app, host="0.0.0.0", port=8002, log_level="info")
        
        server_plor = uvicorn.Server(config_plor)
        server_dm = uvicorn.Server(config_dm)
        
        await asyncio.gather(
            server_plor.serve(),
            server_dm.serve()
        )
    
    asyncio.run(run_mock_services())
