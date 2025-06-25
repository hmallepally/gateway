from fastapi import FastAPI, HTTPException, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
import jwt
from datetime import datetime, timedelta
from app.config import settings
from app.models import User
from app.schemas import UserResponse, TokenResponse
from sqlalchemy.orm import Session
from app.database import get_db

oauth_app = FastAPI(title="Mock OAuth2 Provider")
security = HTTPBearer()

MOCK_USERS = {
    "editor@example.com": {"password": "editor123", "role": "EDITOR", "name": "Editor User"},
    "approver@example.com": {"password": "approver123", "role": "APPROVER", "name": "Approver User"},
    "admin@example.com": {"password": "admin123", "role": "APPROVER", "name": "Admin User"}
}

@oauth_app.post("/oauth/authorize")
async def authorize(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    if email not in MOCK_USERS or MOCK_USERS[email]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_data = MOCK_USERS[email]
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            user_id=email.split("@")[0],
            email=email,
            name=user_data["name"],
            role=user_data["role"]
        )
        db.add(user)
    else:
        user.last_login = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    auth_code = jwt.encode({
        "user_id": user.user_id,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(minutes=10)
    }, settings.secret_key, algorithm=settings.algorithm)
    
    return {"authorization_code": auth_code}

@oauth_app.post("/oauth/token")
async def get_token(authorization_code: str = Form(...), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(authorization_code, settings.secret_key, algorithms=[settings.algorithm])
        user = db.query(User).filter(User.user_id == payload["user_id"]).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        access_token = jwt.encode({
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        }, settings.secret_key, algorithm=settings.algorithm)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse.model_validate(user)
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Authorization code expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authorization code")

@oauth_app.get("/oauth/userinfo")
async def get_userinfo(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        user = db.query(User).filter(User.user_id == payload["user_id"]).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse.model_validate(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
