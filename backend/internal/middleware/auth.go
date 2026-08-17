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

const claimsContextKey contextKey = "claims"

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

			// Кладём claims целиком (а не только role) — до появления
			// многопользовательского режима это было не нужно, но теперь
			// handler'ам (например, будущей атрибуции статей по автору)
			// понадобится знать, КТО именно сделал запрос, а не только
			// с какой ролью.
			ctx := context.WithValue(r.Context(), claimsContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// ClaimsFromContext достаёт claims текущего запроса, положенные RequireAuth.
// Возвращает ok=false, если запрос прошёл без аутентификации
// (не должно случаться на защищённых маршрутах, но лучше проверять явно).
func ClaimsFromContext(ctx context.Context) (*auth.Claims, bool) {
	claims, ok := ctx.Value(claimsContextKey).(*auth.Claims)
	return claims, ok
}

func writeUnauthorized(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
