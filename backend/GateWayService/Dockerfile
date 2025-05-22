# Giai đoạn build
FROM gradle:jdk17-jammy AS builder
WORKDIR /workspace/app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build -x test --no-daemon

# Giai đoạn đóng gói
FROM openjdk:17-jdk-slim
WORKDIR /app
# Tạo thư mục cho file JAR
RUN mkdir -p /app/libs
# Copy tất cả file JAR vào thư mục
COPY --from=builder /workspace/app/build/libs/*.jar /app/libs/
# Đổi ENTRYPOINT để chạy file JAR đầu tiên tìm thấy
EXPOSE 8080
CMD ["sh", "-c", "java -jar /app/libs/*.jar"]