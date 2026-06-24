-- Add admin and user accounts to existing database
-- Run this script if you need to add users to an existing database

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

-- Verify users were added
SELECT id, username, email, full_name, role, enabled, created_at FROM users ORDER BY id;
