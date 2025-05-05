FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

COPY src/main/resources/firebase-config.json src/main/resources/firebase-config.json
COPY build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
