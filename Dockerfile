FROM oven/bun:latest as builder

WORKDIR /app
COPY frontend/ .

RUN bun install
RUN bun run build

FROM caddy:latest

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /srv
