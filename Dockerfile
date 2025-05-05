# 1. Derleme aşaması
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2. Uygulama aşaması (daha hafif image)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/build/libs/app.jar app.jar
COPY firebase-config.json /app/firebase-config.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/firebase-config.json
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
