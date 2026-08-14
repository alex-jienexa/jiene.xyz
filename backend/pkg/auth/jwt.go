package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims — данные, зашитые внутрь JWT.
// jwt.RegisteredClaims даёт стандартные поля (exp, iat) бесплатно —
// не нужно реализовывать проверку срока жизни токена самостоятельно.
type Claims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

// TokenService отвечает за выпуск и проверку JWT токенов.
// Секретный ключ передаётся при создании — никогда не хардкодится
// в коде. В main.go он читается из переменной окружения.
type TokenService struct {
	secret []byte
	ttl    time.Duration
}

func NewTokenService(secret string, ttl time.Duration) *TokenService {
	return &TokenService{secret: []byte(secret), ttl: ttl}
}

// GenerateAdminToken создаёт токен с ролью "admin".
func (s *TokenService) GenerateAdminToken() (string, time.Time, error) {
	expiresAt := time.Now().Add(s.ttl)

	claims := Claims{
		Role: "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.secret)
	if err != nil {
		return "", time.Time{}, err
	}

	return signed, expiresAt, nil
}

// VerifyToken проверяет подпись и срок жизни токена.
// Возвращает распарсенные claims если токен валиден.
func (s *TokenService) VerifyToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		// Защита от атаки "alg confusion": явно проверяем,
		// что алгоритм подписи токена — именно тот, что мы ожидаем.
		// Без этой проверки злоумышленник теоретически может
		// подделать токен, заменив алгоритм на "none".
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.secret, nil
	})

	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
