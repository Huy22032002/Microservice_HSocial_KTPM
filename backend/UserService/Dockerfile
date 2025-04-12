# Use a Java base image (e.g., openjdk)
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy your Gradle wrapper and build files (if any)
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

# Copy the source code
COPY src ./src

# Give execute permission to gradle wrapper
RUN chmod +x gradlew

# Build the project using Gradle
RUN ./gradlew clean build -x test

# Expose the port (if necessary)
EXPOSE 8081

# Run the application (replace with your main class if different)
CMD ["java", "-jar", "build/libs/your-application.jar"]
