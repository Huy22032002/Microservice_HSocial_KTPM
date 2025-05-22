# Giai đoạn build
FROM gradle:jdk17-jammy AS builder
WORKDIR /workspace/app

# Copy gradle files trước để tận dụng cache
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN chmod +x ./gradlew

# Kiểm tra và tải dependencies
RUN ./gradlew dependencies --no-daemon

# Copy mã nguồn và build
COPY src ./src
RUN ./gradlew build -x test --no-daemon

# Giai đoạn đóng gói
FROM openjdk:17-jdk-slim
WORKDIR /app

# Sao chép JAR file từ giai đoạn build
COPY --from=builder /workspace/app/build/libs/*.jar /app/app.jar

# Các biến môi trường mặc định
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Khai báo port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8081/actuator/health || exit 1

# Chạy ứng dụng
CMD java $JAVA_OPTS -jar /app/app.jar