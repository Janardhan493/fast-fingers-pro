# ---------- BUILD STAGE ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Create app folder
WORKDIR /app

# Copy all project files
COPY . .

# Build the Spring Boot jar (skip tests for faster builds)
RUN mvn -q -DskipTests clean package


# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy jar from build stage (whatever jar is built)
COPY --from=build /app/target/fast-fingers-pro-0.0.1-SNAPSHOT.jar app.jar

# Render sets PORT env var, our app should listen on it (via application-prod.properties)
EXPOSE 8080

# Run the jar with prod profile
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
