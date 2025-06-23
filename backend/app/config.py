from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "sqlite:///./gateway.db"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    mock_fico_plor_url: str = "http://localhost:8001"
    mock_fico_dm_url: str = "http://localhost:8002"
    
    class Config:
        env_file = ".env"

settings = Settings()
