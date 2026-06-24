# Multi-stage build for Spring Boot application
FROM maven:3.9.4-openjdk-17-slim AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jdk-slim

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy the built JAR from build stage
COPY --from=build /app/target/water-logging-backend-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]