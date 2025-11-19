# ============================
# 1. Build Stage
# ============================
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn -q -e -B dependency:go-offline

# Copy source
COPY src ./src

# Build Spring Boot layered jar (layered = better Docker caching)
RUN mvn -q -e -B clean package -DskipTests

# ============================
# 2. Runtime Stage
# ============================
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Create non-root user
RUN useradd -ms /bin/bash spring

# Copy layered jar (default path: target/*.jar)
COPY --from=builder /app/target/*.jar app.jar

# Expose HTTP port
EXPOSE 8080

# Optional health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set user
USER spring

# Define ENV variables
ENV APP_NAME="Spring API"

# Run Spring Boot jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
