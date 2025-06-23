from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class FicoEnvironmentConfig(Base):
    __tablename__ = "fico_environment_config"
    
    product_code = Column(String(50), primary_key=True)
    version = Column(String(20), primary_key=True)
    url = Column(String(500), nullable=False)
    authentication_url = Column(String(500), nullable=False)
    client_id = Column(String(100), nullable=False)
    secret = Column(Text, nullable=False)  # Will be encrypted
    created_by = Column(String(100), nullable=False)
    created_on = Column(DateTime, default=datetime.utcnow)
    modified_by = Column(String(100))
    modified_on = Column(DateTime)
    status = Column(String(20), default="ACTIVE")

class ConfigurableParameters(Base):
    __tablename__ = "configurable_parameters"
    
    product_id = Column(String(50), primary_key=True)
    subproduct_id = Column(String(50), primary_key=True)
    component = Column(String(100), primary_key=True)
    parameter = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    effective_from = Column(DateTime, nullable=False)
    effective_to = Column(DateTime)
    created_by = Column(String(100), nullable=False)
    created_on = Column(DateTime, default=datetime.utcnow)
    modified_by = Column(String(100))
    modified_on = Column(DateTime)
    status = Column(String(20), default="ACTIVE")

class ChangeLog(Base):
    __tablename__ = "change_log"
    
    log_id = Column(Integer, primary_key=True, autoincrement=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(String(200), nullable=False)
    field_name = Column(String(100), nullable=False)
    old_value = Column(Text)
    new_value = Column(Text)
    changed_by = Column(String(100), nullable=False)
    change_timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="PENDING_APPROVAL")
    reviewed_by = Column(String(100))
    reviewed_on = Column(DateTime)
    approved_by = Column(String(100))
    approved_on = Column(DateTime)
    comments = Column(Text)
