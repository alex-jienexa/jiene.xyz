# --- stage 1: build ---
FROM golang:1.26.2-alpine AS build

WORKDIR /app

ENV GOPROXY=https://proxy.golang.org,direct
ENV GOSUMDB=sum.golang.org

COPY . .

ARG BUILD_MODE=default

RUN if [ "$BUILD_MODE" = "vendor" ]; then \
        echo "building with vendor"; \
        go mod vendor; \
        CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -mod=vendor -o app; \
    else \
        echo "building with go mod download"; \
        go mod download; \
        CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app; \
    fi

# --- stage 2: runtime ---
FROM alpine:3.23

WORKDIR /app

COPY --from=build /app/app .

EXPOSE 8080

CMD ["./app"]
