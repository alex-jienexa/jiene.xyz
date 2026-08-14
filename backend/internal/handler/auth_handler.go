package handler

import (
	"encoding/json"
	"net/http"

	"alex-jienexa/jiene.xyz/backend/internal/repository"
	"alex-jienexa/jiene.xyz/backend/pkg/auth"

	"golang.org/x/crypto/bcrypt"
)

// AuthHandler обрабатывает единственный эндпоинт — логин.
// Сайт, фактически, может принадлежать нескольким авторам с разными
// ролями, поэтому нужно различать КТО вошёл в приложение.
// Так, пароль проверяется с помощью UserRepository, так как там
// хранятся хэши паролей пользователей.
type AuthHandler struct {
	tokenService *auth.TokenService
	users        repository.UserRepository
}

func NewAuthHandler(tokenService *auth.TokenService, users repository.UserRepository) *AuthHandler {
	return &AuthHandler{tokenService: tokenService, users: users}
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginResponse struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expires_at"`
	UserID    int    `json:"user_id"`
	Username  string `json:"username"`
	Role      string `json:"role"`
}

// Login авторизирует пользователя по username и password
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

	user, err := h.users.GetByUsername(r.Context(), req.Username)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		respondError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, expiresAt, err := h.tokenService.GenerateAdminToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	respondJSON(w, http.StatusOK, loginResponse{
		Token:     token,
		ExpiresAt: expiresAt.Format("2006-01-02T15:04:05Z07:00"),
		UserID:    user.ID,
		Username:  user.Username,
		Role:      string(user.Role),
	})
}
