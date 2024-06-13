CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
     create_date TIMESTAMP
);

CREATE TABLE drugs (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    qoh INT,
    is_active BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP,
    create_uid INT REFERENCES users(id)
);

CREATE TABLE alternative_drug (
    id INT PRIMARY KEY,
    drug_id INT REFERENCES drugs(id),
    alternative_id INT REFERENCES drugs(id),
    create_date TIMESTAMP,
    create_uid INT REFERENCES users(id)
);

CREATE TABLE drug_dispensations (
    id UUID PRIMARY KEY,
    drug_id UUID REFERENCES drugs(id),
    patient_id UUID,
    quantity_dispensed INT,
    dispensed_by UUID REFERENCES users(id),
    dispensation_date TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

