CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(1024) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    create_date TIMESTAMP,
    UNIQUE (email)
);

CREATE TABLE drugs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    qoh INT,
    is_active BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP,
    create_uid INT REFERENCES users(id)
);

CREATE TABLE alternative_drug (
    id SERIAL PRIMARY KEY,
    drug_id INT REFERENCES drugs(id),
    alternative_id INT REFERENCES drugs(id),
    create_date TIMESTAMP,
    create_uid INT REFERENCES users(id)
);

CREATE TABLE drug_dispensations (
    id SERIAL PRIMARY KEY,
    drug_id INT REFERENCES drugs(id),
    patient_id INT,
    quantity_dispensed INT,
    dispensed_by INT REFERENCES users(id),
    dispensation_date TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

