const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// Интерфейс для ошибок API
interface ApiError extends Error {
  status?: number;
  retryAfter?: string | null;
}

// Конструктор для создания ApiError
function createApiError(message: string): ApiError {
  return new Error(message) as ApiError;
}

// Вспомогательная функция: делает fetch и бросает ошибку
// с читаемым текстом, если статус != 2xx.
async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}/${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    const message = body?.error ?? `HTTP ${res.status}`;
    const error = createApiError(message);
    error.status = res.status;
    error.retryAfter = res.headers.get("Retry-After");
    throw error;
  }

  return body;
}

export async function fetchBoard() {
  const data = await request("/api/pixel/board");
  return data.board ?? {};
}

export async function placePixel(x: number, y: number, color: string) {
  return request("/api/pixel/place", {
    method: "POST",
    body: JSON.stringify({ x, y, color }),
  });
}

export async function ping() {
  return request("/api/pixel/ping");
}
