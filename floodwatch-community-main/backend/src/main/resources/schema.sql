-- Water Logging and Drainage Map Database Schema

-- Create database (run this manually if needed)
-- CREATE DATABASE floodwatch_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'ADMIN')),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flood reports table
CREATE TABLE IF NOT EXISTS flood_reports (
    id BIGSERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'SEVERE')),
    description TEXT,
    image_url VARCHAR(500),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED', 'RESOLVED')),
    reported_by BIGINT NOT NULL REFERENCES users(id),
    verified_by BIGINT REFERENCES users(id),
    verified_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flood_reports_status ON flood_reports(status);
CREATE INDEX IF NOT EXISTS idx_flood_reports_severity ON flood_reports(severity);
CREATE INDEX IF NOT EXISTS idx_flood_reports_location ON flood_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_flood_reports_created_at ON flood_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_flood_reports_reported_by ON flood_reports(reported_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flood_reports_updated_at ON flood_reports;
CREATE TRIGGER update_flood_reports_updated_at
    BEFORE UPDATE ON flood_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, role) 
VALUES ('admin', 'admin@floodwatch.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert default regular user (password: user123)
INSERT INTO users (username, email, password, full_name, role) 
VALUES ('user', 'user@floodwatch.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular User', 'CITIZEN')
ON CONFLICT (email) DO NOTHING;

-- Insert test admin user (password: admin)
INSERT INTO users (username, email, password, full_name, role) 
VALUES ('testadmin', 'testadmin@floodwatch.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Test Administrator', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert test regular user (password: user)
INSERT INTO users (username, email, password, full_name, role) 
VALUES ('testuser', 'testuser@floodwatch.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Test User', 'CITIZEN')
ON CONFLICT (email) DO NOTHING;