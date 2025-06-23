

CREATE TABLE IF NOT EXISTS fico_environment_config (
    product_code VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    url VARCHAR(500) NOT NULL,
    authentication_url VARCHAR(500) NOT NULL,
    client_id VARCHAR(100) NOT NULL,
    secret TEXT NOT NULL,  -- Encrypted client secret
    created_by VARCHAR(100) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(100),
    modified_on TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    PRIMARY KEY (product_code, version)
);

CREATE TABLE IF NOT EXISTS configurable_parameters (
    product_id VARCHAR(50) NOT NULL,
    subproduct_id VARCHAR(50) NOT NULL,
    component VARCHAR(100) NOT NULL,
    parameter VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(100),
    modified_on TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    PRIMARY KEY (product_id, subproduct_id, component, parameter)
);

CREATE TABLE IF NOT EXISTS change_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(200) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(100) NOT NULL,
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING_APPROVAL',
    reviewed_by VARCHAR(100),
    reviewed_on TIMESTAMP,
    approved_by VARCHAR(100),
    approved_on TIMESTAMP,
    comments TEXT
);

CREATE INDEX IF NOT EXISTS idx_fico_config_status ON fico_environment_config(status);
CREATE INDEX IF NOT EXISTS idx_fico_config_product ON fico_environment_config(product_code);

CREATE INDEX IF NOT EXISTS idx_params_product ON configurable_parameters(product_id, subproduct_id);
CREATE INDEX IF NOT EXISTS idx_params_effective ON configurable_parameters(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_params_status ON configurable_parameters(status);

CREATE INDEX IF NOT EXISTS idx_changelog_table ON change_log(table_name);
CREATE INDEX IF NOT EXISTS idx_changelog_status ON change_log(status);
CREATE INDEX IF NOT EXISTS idx_changelog_timestamp ON change_log(change_timestamp);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gateway_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gateway_user;

INSERT INTO change_log (table_name, record_id, field_name, old_value, new_value, changed_by, status, comments)
VALUES ('schema', 'initialization', 'database_schema', 'empty', 'created', 'system', 'APPROVED', 'Database schema initialized successfully');

SELECT 'API Gateway database schema created successfully!' as result;
