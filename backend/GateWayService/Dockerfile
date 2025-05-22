# Giai đoạn build
FROM gradle:jdk17-jammy AS builder
WORKDIR /workspace/app

# Copy gradle files để tận dụng cache
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN chmod +x ./gradlew

# Tải dependencies
RUN ./gradlew dependencies --no-daemon

# Copy source code và build
COPY src ./src
RUN ./gradlew build -x test --no-daemon

# Giai đoạn runtime
FROM openjdk:17-jdk-slim
WORKDIR /app

# Đặt tên cụ thể cho file JAR
COPY --from=builder /workspace/app/build/libs/*.jar /app/gateway-service.jar

# Cấu hình mặc định
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms512m -Xmx1024m"  

# Port mặc định
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Chạy ứng dụng
CMD java $JAVA_OPTS -jar /app/gateway-service.jar