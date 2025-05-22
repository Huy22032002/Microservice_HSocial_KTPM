# Giai đoạn build
FROM gradle:jdk17-jammy AS builder
WORKDIR /workspace/app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build -x test --no-daemon

# Giai đoạn đóng gói
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /workspace/app/build/libs/UserService-*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","app.jar"]