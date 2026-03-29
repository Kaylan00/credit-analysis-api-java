# ── Stage 1: Build ──────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

# ── Stage 2: Runtime ────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

**`.dockerignore`** — na raiz do projeto
```
.gradle
build
.git
*.md
.gitignore
```

---

**`.gitignore`** — na raiz do projeto
```
HELP.md
.gradle
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

### VS Code ###
.vscode/
*.code-workspace

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### OS ###
.DS_Store
Thumbs.db

### Secrets ###
*.env
application-prod.properties