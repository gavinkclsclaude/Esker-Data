-- User authentication schema
-- Run this script to create the necessary tables for user authentication

-- Create app_users table (using app_ prefix to avoid conflict with existing users table)
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_sessions_token ON user_sessions(token);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE
    ON app_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial admin user (password: admin123)
-- Note: In production, change this password immediately after setup
INSERT INTO app_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@example.com',
    '$2b$10$YourHashedPasswordHere', -- This will be replaced with actual hash
    'System Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Grant permissions (adjust based on your database user)
-- GRANT ALL PRIVILEGES ON TABLE app_users TO your_db_user;
-- GRANT ALL PRIVILEGES ON TABLE user_sessions TO your_db_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_db_user;