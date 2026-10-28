# === STAGE 1: Frontend builder ===

FROM oven/bun:1.3.13-alpine AS frontend-builder

WORKDIR /app/frontend

# Копируем и собираем пакеты
COPY frontend/package.json frontend/bun.lock ./
RUN bun ci --frozen-lockfile

# Собираем статику
COPY frontend/ .
RUN bun run build

# === STAGE 2: Backend builder ===

FROM golang:1.26.4-alpine AS backend-builder
# Собираем документацию для запуска
RUN --mount=type=cache,target=/go/pkg/mod \
    go install github.com/swaggo/swag/cmd/swag@v1.16.6

WORKDIR /app/backend

# Скачиваем необходимые пакеты
COPY backend/go.mod backend/go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

# Копируем файлы бекенда и файлы сборки
COPY backend/ .
COPY --from=frontend-builder /app/frontend/dist ./internal/static/files/

# Собираем доки
RUN swag init -g cmd/server/main.go --output docs

# Собираем бинарник
RUN --mount=type=cache,target=/root/.cache/go-build \
     CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o jiene-server \
    ./cmd/server/
# Перенесём скрипт создания пользователей туда же
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o create-user \
    ./cmd/createuser/


# === STAGE 3: Запуск приложения ===

FROM scratch AS runtime

WORKDIR /app

COPY --from=backend-builder /app/backend/jiene-server .
COPY --from=backend-builder /app/backend/create-user .

EXPOSE $BACKEND_PORT

CMD ["./jiene-server"]