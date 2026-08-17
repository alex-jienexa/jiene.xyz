package handler

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/service"
	"encoding/json"
	"net/http"
	"time"
)

type ProfileHandler struct {
	service *service.ProfileService
}

func NewProfileHandler(s *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{service: s}
}

type profileResponse struct {
	Name      string       `json:"name"`
	Alias     string       `json:"alias"`
	Role      string       `json:"role"`
	Status    string       `json:"status"`
	Tags      []string     `json:"tags"`
	Links     profileLinks `json:"links"`
	UpdatedAt time.Time    `json:"updated_at"`
}

type profileLinks struct {
	GitHub   string `json:"github"`
	Email    string `json:"email"`
	Telegram string `json:"tg"`
}

// Get получает информацию о единственном пользователе-админе сайта
//
// @Summary	Получить информацию об админе
// @Tags	profile
// @Accept	json
// @Produce	json
// @Success	200	{object}	profileResponse	"Информация получена"
// @Failure	404	{object}	errorResponse	"Профиль не обнаружен"
// @Router	/whoami	[get]
func (h *ProfileHandler) Get(w http.ResponseWriter, r *http.Request) {
	profile, err := h.service.Get(r.Context())
	if err != nil {
		mapDomainError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, toProfileDTO(profile))
}

// Update обновляет информацию об админе
//
// @Summary		Обновление информации об админе
// @Tags		profile
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		body 	body 	entity.ProfileUpdateInput	true	"Обновлённая информация"
// @Success		200	{object}	profileResponse	"Обновление успешно"
// @Failure		400 {object}	errorResponse	"Невалидная информация"
// @Failure		404	{object}	errorResponse	"Профиль не обнаружен"
// @Router		/whoami	[put]
func (h *ProfileHandler) Update(w http.ResponseWriter, r *http.Request) {
	var input entity.ProfileUpdateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	profile, err := h.service.Update(r.Context(), input)
	if err != nil {
		mapDomainError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, toProfileDTO(profile))
}

func toProfileDTO(p *entity.Profile) profileResponse {
	var tags []string
	json.Unmarshal(p.Tags, &tags)
	var links profileLinks
	json.Unmarshal(p.Links, &links)

	return profileResponse{
		Name:      p.Name,
		Alias:     p.Alias,
		Role:      p.Role,
		Status:    p.Status,
		Tags:      tags,
		Links:     links,
		UpdatedAt: p.UpdatedAt,
	}
}
