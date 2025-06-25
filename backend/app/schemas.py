from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class FicoEnvironmentConfigBase(BaseModel):
    product_code: str
    version: str
    url: str
    authentication_url: str
    client_id: str
    secret: str

class FicoEnvironmentConfigCreate(FicoEnvironmentConfigBase):
    created_by: str

class FicoEnvironmentConfigUpdate(BaseModel):
    url: Optional[str] = None
    authentication_url: Optional[str] = None
    client_id: Optional[str] = None
    secret: Optional[str] = None
    modified_by: str

class FicoEnvironmentConfigResponse(FicoEnvironmentConfigBase):
    created_by: str
    created_on: datetime
    modified_by: Optional[str] = None
    modified_on: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True

class ConfigurableParametersBase(BaseModel):
    product_id: str
    subproduct_id: str
    component: str
    parameter: str
    value: str
    effective_from: datetime
    effective_to: Optional[datetime] = None

class ConfigurableParametersCreate(ConfigurableParametersBase):
    created_by: str

class ConfigurableParametersUpdate(BaseModel):
    value: Optional[str] = None
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    modified_by: str

class ConfigurableParametersResponse(ConfigurableParametersBase):
    created_by: str
    created_on: datetime
    modified_by: Optional[str] = None
    modified_on: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True

class ChangeLogResponse(BaseModel):
    log_id: int
    table_name: str
    record_id: str
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_by: str
    change_timestamp: datetime
    status: str
    reviewed_by: Optional[str] = None
    reviewed_on: Optional[datetime] = None
    approved_by: Optional[str] = None
    approved_on: Optional[datetime] = None
    comments: Optional[str] = None

    class Config:
        from_attributes = True

class GatewayRequest(BaseModel):
    headers: Dict[str, str] = {}
    body: Dict[str, Any]
    method: str = "POST"

class GatewayResponse(BaseModel):
    status_code: int
    headers: Dict[str, str] = {}
    body: Dict[str, Any]

class ApprovalRequest(BaseModel):
    log_id: int
    action: str
    comments: Optional[str] = None
    approved_by: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_on: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse
