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
    unit_price FLOAT,
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


CREATE TABLE patient (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dob DATE,
    phone_number VARCHAR(50) NOT NULL,
    address VARCHAR(225),
    create_uid INT REFERENCES users(id),
    create_date TIMESTAMP
);

CREATE TABLE prescription (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient(id),
    dispensed_by INT,
    create_date TIMESTAMP,
    total_amount FLOAT
);

CREATE TABLE prescription_item(
	id SERIAL PRIMARY KEY,
	prescription_id INT REFERENCES prescription(id),
	drug_id INT REFERENCES drugs(id),
	qty INT,
	unit_price Float,
	create_date TIMESTAMP
);


CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

