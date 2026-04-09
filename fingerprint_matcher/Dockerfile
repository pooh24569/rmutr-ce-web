# ===================================================================
# ☕ Dockerfile — SourceAFIS Fingerprint Matcher
# ===================================================================
# Multi-stage build:
# Stage 1: Maven build → JAR
# Stage 2: Slim JRE runtime → run JAR
# ===================================================================

# --- Stage 1: Build ---
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first (เพื่อ leverage Docker layer caching สำหรับ dependencies)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build JAR (skip tests สำหรับ speed)
RUN mvn package -DskipTests -B

# --- Stage 2: Runtime ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR จาก builder stage
COPY --from=builder /app/target/*.jar app.jar

# Port ที่ service ใช้
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:8090/api/health || exit 1

# Start service
ENTRYPOINT ["java", "-jar", "app.jar"]
