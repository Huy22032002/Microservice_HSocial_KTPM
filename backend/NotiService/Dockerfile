# syntax=docker/dockerfile:1
FROM openjdk:17-jdk-slim

# Thư mục làm việc trong container
WORKDIR /app

# Copy file JAR vào container
COPY build/libs/*.jar app.jar

# Expose port mà NotiService chạy (8084)
EXPOSE 8084

# Lệnh chạy app
ENTRYPOINT ["java", "-jar", "app.jar"]
