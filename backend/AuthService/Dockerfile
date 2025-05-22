# Giai đoạn build (builder stage)
FROM gradle:jdk17-jammy AS builder
WORKDIR /workspace/app
# Sao chép toàn bộ mã nguồn của AuthService (từ Root Directory của bạn trên Render) vào image builder
COPY . .
# Chạy lệnh build Gradle. --no-daemon thường được khuyên dùng cho môi trường CI/CD.
# Nếu tệp gradlew chưa có quyền thực thi, bạn có thể thêm: RUN chmod +x ./gradlew
RUN ./gradlew build --no-daemon

# Giai đoạn đóng gói (package stage)
FROM openjdk:17-jdk-slim
WORKDIR /app
# Sao chép tệp JAR đã được build từ giai đoạn builder vào image cuối cùng
COPY --from=builder /workspace/app/build/libs/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]