from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import logging

from app.database import get_db, create_tables
from app.models import FicoEnvironmentConfig, ConfigurableParameters, ChangeLog
from app.schemas import (
    FicoEnvironmentConfigCreate, FicoEnvironmentConfigUpdate, FicoEnvironmentConfigResponse,
    ConfigurableParametersCreate, ConfigurableParametersUpdate, ConfigurableParametersResponse,
    ChangeLogResponse, GatewayRequest, GatewayResponse, ApprovalRequest
)
from app.services.gateway_service import gateway_service
from app.services.cache_service import cache_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Gateway", description="Enterprise API Gateway and Configuration Management System")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup_event():
    create_tables()
    logger.info("Database tables created")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/gateway", response_model=Dict[str, Any])
async def process_gateway_request(
    request: GatewayRequest,
    db: Session = Depends(get_db)
):
    """Main gateway endpoint for processing requests"""
    try:
        response_data, status_code = await gateway_service.process_request(
            db, request.dict()
        )
        return {
            "status_code": status_code,
            "data": response_data
        }
    except Exception as e:
        logger.error(f"Gateway processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal gateway error")

@app.post("/api/fico-configs", response_model=FicoEnvironmentConfigResponse)
async def create_fico_config(
    config: FicoEnvironmentConfigCreate,
    db: Session = Depends(get_db)
):
    """Create new Fico environment configuration"""
    db_config = FicoEnvironmentConfig(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@app.get("/api/fico-configs", response_model=List[FicoEnvironmentConfigResponse])
async def get_fico_configs(db: Session = Depends(get_db)):
    """Get all Fico environment configurations"""
    return db.query(FicoEnvironmentConfig).all()

@app.get("/api/fico-configs/{product_code}/{version}", response_model=FicoEnvironmentConfigResponse)
async def get_fico_config(
    product_code: str,
    version: str,
    db: Session = Depends(get_db)
):
    """Get specific Fico environment configuration"""
    config = db.query(FicoEnvironmentConfig).filter(
        FicoEnvironmentConfig.product_code == product_code,
        FicoEnvironmentConfig.version == version
    ).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@app.put("/api/fico-configs/{product_code}/{version}", response_model=FicoEnvironmentConfigResponse)
async def update_fico_config(
    product_code: str,
    version: str,
    config_update: FicoEnvironmentConfigUpdate,
    db: Session = Depends(get_db)
):
    """Update Fico environment configuration"""
    config = db.query(FicoEnvironmentConfig).filter(
        FicoEnvironmentConfig.product_code == product_code,
        FicoEnvironmentConfig.version == version
    ).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    for field, value in config_update.dict(exclude_unset=True).items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    return config

@app.post("/api/parameters", response_model=ConfigurableParametersResponse)
async def create_parameter(
    parameter: ConfigurableParametersCreate,
    db: Session = Depends(get_db)
):
    """Create new configurable parameter"""
    db_parameter = ConfigurableParameters(**parameter.dict())
    db.add(db_parameter)
    db.commit()
    db.refresh(db_parameter)
    
    cache_service.invalidate_cache(parameter.product_id, parameter.subproduct_id)
    
    return db_parameter

@app.get("/api/parameters", response_model=List[ConfigurableParametersResponse])
async def get_parameters(db: Session = Depends(get_db)):
    """Get all configurable parameters"""
    return db.query(ConfigurableParameters).all()

@app.get("/api/parameters/{product_id}/{subproduct_id}", response_model=List[ConfigurableParametersResponse])
async def get_parameters_by_product(
    product_id: str,
    subproduct_id: str,
    db: Session = Depends(get_db)
):
    """Get parameters for specific product/subproduct"""
    return db.query(ConfigurableParameters).filter(
        ConfigurableParameters.product_id == product_id,
        ConfigurableParameters.subproduct_id == subproduct_id
    ).all()

@app.put("/api/parameters/{product_id}/{subproduct_id}/{component}/{parameter}")
async def update_parameter(
    product_id: str,
    subproduct_id: str,
    component: str,
    parameter: str,
    parameter_update: ConfigurableParametersUpdate,
    db: Session = Depends(get_db)
):
    """Update configurable parameter"""
    param = db.query(ConfigurableParameters).filter(
        ConfigurableParameters.product_id == product_id,
        ConfigurableParameters.subproduct_id == subproduct_id,
        ConfigurableParameters.component == component,
        ConfigurableParameters.parameter == parameter
    ).first()
    
    if not param:
        raise HTTPException(status_code=404, detail="Parameter not found")
    
    for field, value in parameter_update.dict(exclude_unset=True).items():
        setattr(param, field, value)
    
    db.commit()
    db.refresh(param)
    
    cache_service.invalidate_cache(product_id, subproduct_id)
    
    return param

@app.get("/api/change-logs", response_model=List[ChangeLogResponse])
async def get_change_logs(db: Session = Depends(get_db)):
    """Get all change logs"""
    return db.query(ChangeLog).order_by(ChangeLog.change_timestamp.desc()).all()

@app.get("/api/change-logs/pending", response_model=List[ChangeLogResponse])
async def get_pending_changes(db: Session = Depends(get_db)):
    """Get pending approval changes"""
    return db.query(ChangeLog).filter(
        ChangeLog.status == "PENDING_APPROVAL"
    ).order_by(ChangeLog.change_timestamp.desc()).all()

@app.post("/api/change-logs/{log_id}/approve")
async def approve_change(
    log_id: int,
    approval: ApprovalRequest,
    db: Session = Depends(get_db)
):
    """Approve or reject a pending change"""
    change_log = db.query(ChangeLog).filter(ChangeLog.log_id == log_id).first()
    if not change_log:
        raise HTTPException(status_code=404, detail="Change log not found")
    
    if approval.action == "APPROVE":
        change_log.status = "APPROVED"
        change_log.approved_by = approval.approved_by
        change_log.approved_on = datetime.utcnow()
    elif approval.action == "REJECT":
        change_log.status = "REJECTED"
        change_log.reviewed_by = approval.approved_by
        change_log.reviewed_on = datetime.utcnow()
    
    change_log.comments = approval.comments
    db.commit()
    
    return {"message": f"Change {approval.action.lower()}ed successfully"}

@app.post("/api/cache/refresh/{product_id}/{subproduct_id}")
async def refresh_cache(
    product_id: str,
    subproduct_id: str,
    db: Session = Depends(get_db)
):
    """Manually refresh cache for specific product/subproduct"""
    cached_params = cache_service.refresh_parameters_cache(db, product_id, subproduct_id)
    return {
        "message": "Cache refreshed successfully",
        "cached_parameters": cached_params
    }

@app.delete("/api/cache/{product_id}/{subproduct_id}")
async def invalidate_cache(product_id: str, subproduct_id: str):
    """Invalidate cache for specific product/subproduct"""
    cache_service.invalidate_cache(product_id, subproduct_id)
    return {"message": "Cache invalidated successfully"}
