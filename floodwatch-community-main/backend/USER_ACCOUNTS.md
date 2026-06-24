# User Accounts Setup

This document explains how to add admin and user accounts to the FloodWatch database.

## Pre-configured Accounts

The following accounts are automatically created when the application starts:

### Admin Accounts
- **Email:** admin@floodwatch.com  
  **Password:** admin123  
  **Role:** ADMIN

- **Email:** testadmin@floodwatch.com  
  **Password:** admin  
  **Role:** ADMIN

### Regular User Accounts
- **Email:** user@floodwatch.com  
  **Password:** user123  
  **Role:** CITIZEN

- **Email:** testuser@floodwatch.com  
  **Password:** user  
  **Role:** CITIZEN

## How Users Are Created

### 1. Automatic Creation (Recommended)
The `DataInitializer` class automatically creates these users when the application starts if they don't already exist.

### 2. Database Schema
The `schema.sql` file includes INSERT statements to create these users when the database is first initialized.

### 3. Manual SQL Script
You can run the `add-users.sql` script manually to add users to an existing database:

```bash
psql -h localhost -U postgres -d floodwatch_db -f add-users.sql
```

## Testing the Accounts

### Using the API
You can test login with these accounts using the authentication endpoint:

```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@floodwatch.com","password":"admin123"}'

# Login as regular user
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@floodwatch.com","password":"user123"}'
```

### Using the Frontend
Use these credentials in the login form of your frontend application.

## Password Security

All passwords are encrypted using BCrypt before being stored in the database. The plain text passwords shown above are for development/testing purposes only.

## Adding New Users

### Through the API
Use the registration endpoint to create new users:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "fullName": "New User",
    "phoneNumber": "+1234567890"
  }'
```

### Through Database
You can manually insert users into the database:

```sql
INSERT INTO users (username, email, password, full_name, role) 
VALUES ('newuser', 'newuser@example.com', '$2a$10$encrypted_password_here', 'New User', 'CITIZEN');
```

Note: Make sure to encrypt the password using BCrypt before inserting.

## Role Permissions

- **ADMIN:** Can verify, reject, and resolve flood reports
- **CITIZEN:** Can create flood reports and view their own reports

## Troubleshooting

If users are not being created automatically:
1. Check the application logs for any errors
2. Ensure the database connection is working
3. Verify that the `DataInitializer` class is being executed
4. Check if users already exist in the database

To verify users exist:
```sql
SELECT id, username, email, full_name, role, enabled FROM users;
```
