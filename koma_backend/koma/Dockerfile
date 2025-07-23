FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8443
ENTRYPOINT ["java", "-jar","-DPORT=8443","app.jar"]
