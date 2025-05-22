# Giai đoạn build (builder stage)
FROM gradle:jdk17-jammy AS builder
WORKDIR /workspace/app
# Sao chép toàn bộ mã nguồn của AuthService (từ Root Directory của bạn trên Render) vào image builder
COPY . .
# Cấp quyền thực thi cho gradlew
RUN chmod +x ./gradlew
# Chạy lệnh build Gradle. --no-daemon thường được khuyên dùng cho môi trường CI/CD.
RUN ./gradlew build --no-daemon

# Giai đoạn đóng gói (package stage)
FROM openjdk:17-jdk-slim
WORKDIR /app
# Sao chép tệp JAR đã được build từ giai đoạn builder vào image cuối cùng
COPY --from=builder /workspace/app/build/libs/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]