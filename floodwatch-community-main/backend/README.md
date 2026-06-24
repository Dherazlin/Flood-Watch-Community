# Water Logging and Drainage Map - Backend

Spring Boot backend for the Water Logging and Drainage Map platform.

## Features

- User authentication and authorization (JWT-based)
- Flood report management with GPS coordinates
- Image upload functionality
- Admin dashboard APIs
- Role-based access control (Citizen/Admin)
- PostgreSQL database integration
- RESTful API design

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security with JWT
- **Database**: PostgreSQL
- **Build Tool**: Maven
- **Java Version**: 17

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- PostgreSQL 12 or higher

### Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE floodwatch_db;
```

2. Update database credentials in `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/floodwatch_db
    username: your_username
    password: your_password
```

3. The application will automatically create tables on startup using the schema in `src/main/resources/schema.sql`

### Running the Application

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/validate` - Validate JWT token

### Flood Reports
- `GET /api/reports` - Get all reports (with status filter)
- `POST /api/reports` - Create new flood report
- `GET /api/reports/active` - Get active reports (last 24 hours)
- `GET /api/reports/bounds` - Get reports within map bounds
- `GET /api/reports/my-reports` - Get current user's reports
- `POST /api/reports/{id}/image` - Upload image for report
- `PUT /api/reports/{id}/verify` - Verify report (Admin only)
- `PUT /api/reports/{id}/reject` - Reject report (Admin only)
- `PUT /api/reports/{id}/resolve` - Resolve report (Admin only)
- `GET /api/reports/stats` - Get report statistics

## Default Admin Account

- **Email**: admin@floodwatch.com
- **Password**: admin123

## Environment Variables

Key configuration options in `application.yml`:

- `spring.datasource.url` - Database URL
- `spring.datasource.username` - Database username
- `spring.datasource.password` - Database password
- `jwt.secret` - JWT signing secret
- `jwt.expiration` - Token expiration time (milliseconds)
- `file.upload-dir` - Directory for uploaded images

## API Documentation

### Sample Request/Response

**Register User:**
```json
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**Create Flood Report:**
```json
POST /api/reports
Authorization: Bearer <token>
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "severity": "HIGH",
  "description": "Severe waterlogging on main road",
  "location": "Delhi, India"
}
```

## Security

- JWT tokens expire after 24 hours
- Passwords are encrypted using BCrypt
- CORS is configured for frontend origins
- Role-based access control for admin functions
- File upload validation and size limits

## Development

To run in development mode with hot reload:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

For testing:
```bash
mvn test
```

## Production Deployment

1. Build the JAR file:
```bash
mvn clean package
```

2. Run with production profile:
```bash
java -jar target/water-logging-backend-1.0.0.jar --spring.profiles.active=prod
```

## Troubleshooting

- Ensure PostgreSQL is running and accessible
- Check database credentials in application.yml
- Verify Java 17 is installed
- For CORS issues, update allowed origins in SecurityConfig.java