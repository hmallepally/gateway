from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import SessionLocal, create_tables
from app.models import FicoEnvironmentConfig, ConfigurableParameters, ChangeLog, User

def create_seed_data():
    """Create dummy data for testing"""
    create_tables()
    db = SessionLocal()
    
    try:
        db.query(ChangeLog).delete()
        db.query(ConfigurableParameters).delete()
        db.query(FicoEnvironmentConfig).delete()
        db.query(User).delete()
        db.commit()
        
        users = [
            User(
                user_id="editor",
                email="editor@example.com",
                name="Editor User",
                role="EDITOR"
            ),
            User(
                user_id="approver",
                email="approver@example.com", 
                name="Approver User",
                role="APPROVER"
            ),
            User(
                user_id="admin",
                email="admin@example.com",
                name="Admin User", 
                role="APPROVER"
            )
        ]
        
        for user in users:
            db.merge(user)
        db.commit()
        
        fico_configs = [
            FicoEnvironmentConfig(
                product_code="PLOR",
                version="1.2",
                url="http://localhost:8001/api/plor/process",
                authentication_url="http://localhost:8001/oauth/token",
                client_id="plor_client_123",
                secret="plor_secret_456",
                created_by="admin",
                status="ACTIVE"
            ),
            FicoEnvironmentConfig(
                product_code="PLOR",
                version="2.0",
                url="http://localhost:8001/api/plor/process",
                authentication_url="http://localhost:8001/oauth/token",
                client_id="plor_client_200",
                secret="plor_secret_789",
                created_by="admin",
                status="ACTIVE"
            ),
            FicoEnvironmentConfig(
                product_code="DM",
                version="1.5",
                url="http://localhost:8002/api/dm/decision",
                authentication_url="http://localhost:8002/oauth/token",
                client_id="dm_client_abc",
                secret="dm_secret_def",
                created_by="admin",
                status="ACTIVE"
            )
        ]
        
        for config in fico_configs:
            db.add(config)
        
        current_time = datetime.utcnow()
        parameters = [
            ConfigurableParameters(
                product_id="CREDIT_CARD",
                subproduct_id="PREMIUM",
                component="SCORING",
                parameter="min_score_threshold",
                value="700",
                effective_from=current_time - timedelta(days=30),
                created_by="admin",
                status="ACTIVE"
            ),
            ConfigurableParameters(
                product_id="CREDIT_CARD",
                subproduct_id="PREMIUM",
                component="SCORING",
                parameter="max_debt_ratio",
                value="0.4",
                effective_from=current_time - timedelta(days=30),
                created_by="admin",
                status="ACTIVE"
            ),
            ConfigurableParameters(
                product_id="CREDIT_CARD",
                subproduct_id="STANDARD",
                component="SCORING",
                parameter="min_score_threshold",
                value="650",
                effective_from=current_time - timedelta(days=15),
                created_by="admin",
                status="ACTIVE"
            ),
            ConfigurableParameters(
                product_id="PERSONAL_LOAN",
                subproduct_id="SECURED",
                component="RISK_ASSESSMENT",
                parameter="collateral_ratio",
                value="1.2",
                effective_from=current_time - timedelta(days=10),
                created_by="admin",
                status="ACTIVE"
            ),
            ConfigurableParameters(
                product_id="PERSONAL_LOAN",
                subproduct_id="SECURED",
                component="RISK_ASSESSMENT",
                parameter="max_loan_amount",
                value="100000",
                effective_from=current_time - timedelta(days=10),
                created_by="admin",
                status="ACTIVE"
            ),
            ConfigurableParameters(
                product_id="CREDIT_CARD",
                subproduct_id="PREMIUM",
                component="SCORING",
                parameter="min_score_threshold",
                value="720",
                effective_from=current_time + timedelta(days=30),
                created_by="admin",
                status="ACTIVE"
            )
        ]
        
        for param in parameters:
            db.add(param)
        
        change_logs = [
            ChangeLog(
                table_name="configurable_parameters",
                record_id="CREDIT_CARD:PREMIUM:SCORING:min_score_threshold",
                field_name="value",
                old_value="680",
                new_value="700",
                changed_by="editor1",
                status="APPROVED",
                approved_by="approver1",
                approved_on=current_time - timedelta(days=5),
                comments="Increased threshold for better risk management"
            ),
            ChangeLog(
                table_name="configurable_parameters",
                record_id="PERSONAL_LOAN:SECURED:RISK_ASSESSMENT:max_loan_amount",
                field_name="value",
                old_value="80000",
                new_value="100000",
                changed_by="editor2",
                status="PENDING_APPROVAL",
                comments="Increase loan limit for secured loans"
            ),
            ChangeLog(
                table_name="fico_environment_config",
                record_id="PLOR:2.0",
                field_name="url",
                old_value="http://old-plor.fico.com/api",
                new_value="http://localhost:8001/api/plor/process",
                changed_by="admin",
                status="APPROVED",
                approved_by="approver1",
                approved_on=current_time - timedelta(days=2),
                comments="Updated to new PLOR endpoint"
            )
        ]
        
        for log in change_logs:
            db.add(log)
        
        db.commit()
        print("Seed data created successfully!")
        
    except Exception as e:
        print(f"Error creating seed data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
