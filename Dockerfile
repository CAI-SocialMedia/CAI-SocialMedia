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
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
