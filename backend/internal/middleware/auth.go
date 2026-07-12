package middleware

import (
	"alex-jienexa/jiene.xyz/backend/pkg/auth"
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

// contextKey — приватный тип для ключей в context.Context.
type contextKey string

const roleContextKey contextKey = "role"

// RequireAuth — middleware, защищающий admin-эндпоинты.
// Извлекает токен из заголовка Authorization, проверяет подпись
// через TokenService, и либо пускает запрос дальше, либо
// возвращает 401 немедленно, не вызывая следующий handler.
func RequireAuth(tokenService *auth.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if header == "" {
				writeUnauthorized(w, "missing Authorization header")
				return
			}

			// Ожидаем формат "Bearer <token>".
			parts := strings.SplitN(header, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				writeUnauthorized(w, "invalid Authorization header format")
				return
			}

			claims, err := tokenService.VerifyToken(parts[1])
			if err != nil {
				writeUnauthorized(w, "invalid or expired token")
				return
			}

			// Кладём роль в context — handler может прочитать её
			// если понадобится более гранулярная проверка прав в будущем.
			ctx := context.WithValue(r.Context(), roleContextKey, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func writeUnauthorized(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
