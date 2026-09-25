-- Medi Q - AI Smart Hospital Queue Management - Database Schema

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id),
    avg_consultation_time INT DEFAULT 15 -- minutes
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(20),
    age INT,
    gender VARCHAR(10)
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    doctor_id INT REFERENCES doctors(id),
    scheduled_time TIMESTAMP NOT NULL,
    predicted_wait_minutes INT,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, WAITING, IN_PROGRESS, DONE, CANCELLED
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE triage_records (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id),
    symptoms TEXT,
    severity_level VARCHAR(20) -- LOW, MEDIUM, HIGH, CRITICAL
);

CREATE TABLE queue (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id),
    position INT,
    priority_score DOUBLE PRECISION DEFAULT 0,
    entry_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wait_time_logs (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id),
    predicted_wait_minutes INT,
    actual_wait_minutes INT
);

CREATE TABLE no_show_predictions (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id),
    no_show_probability DOUBLE PRECISION
);

CREATE TABLE anomaly_logs (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id),
    detected_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

-- Sample seed data
INSERT INTO departments (name) VALUES ('General Medicine'), ('Cardiology'), ('Emergency');
INSERT INTO doctors (name, department_id, avg_consultation_time) VALUES
  ('Dr. Sharma', 1, 12),
  ('Dr. Iyer', 2, 20),
  ('Dr. Rao', 3, 8);
