package handler

import (
	"encoding/json"
	"net/http"

	"alex-jienexa/jiene.xyz/backend/pkg/auth"

	"golang.org/x/crypto/bcrypt"
)

// AuthHandler обрабатывает единственный эндпоинт — логин.
// На сайте одного автора нет регистрации, нет восстановления пароля —
// это сознательное упрощение, описанное в design doc (секция 9).
type AuthHandler struct {
	tokenService *auth.TokenService
	passwordHash string // bcrypt-хэш, читается из переменной окружения в main.go
}

func NewAuthHandler(tokenService *auth.TokenService, passwordHash string) *AuthHandler {
	return &AuthHandler{tokenService: tokenService, passwordHash: passwordHash}
}

type loginRequest struct {
	Password string `json:"password"`
}

type loginResponse struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expires_at"`
}

// Login авторизирует пользователя в базу данных
//
// @Summary		Авторизация пользователя
// @Tags		Auth
// @Accept		json
// @Produce		json
// @Param		body	body 	loginRequest	true	"Форма для входа"
// @Success		200	{object}	loginResponse	"Вход успешный"
// @Failure		400	{object}	errorResponse	"Невалидные данные"
// @Failure		401	{object}	errorResponse	"Неверный пароль"
// @Failure		500 {object}	errorResponse	"Внутренняя ошибка сервера"
// @Router		/auth/login	[post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(h.passwordHash), []byte(req.Password))
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, expiresAt, err := h.tokenService.GenerateAdminToken()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	respondJSON(w, http.StatusOK, loginResponse{
		Token:     token,
		ExpiresAt: expiresAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}
