FROM oven/bun:latest

WORKDIR /app
COPY frontend/ .

RUN bun install
RUN bun run build

EXPOSE 3000

# Todo: заменить потом из `vite preview` на полноценный build.
# Это требует отдельного сервера (бекенда например).
CMD ["bun", "run", "serve"]
