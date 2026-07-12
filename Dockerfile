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

WORKDIR /app/backend

# Скачиваем необходимые пакеты
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Копируем файлы бекенда и файлы сборки
COPY backend/ .
COPY --from=frontend-builder /app/frontend/dist ./internal/static/files/

# Собираем бинарник
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o jiene-server \
    ./cmd/server/

# === STAGE 3: Запуск приложения ===

FROM scratch AS runtime

WORKDIR /app

COPY --from=backend-builder /app/backend/jiene-server .

EXPOSE $BACKEND_PORT

CMD ["./jiene-server"]