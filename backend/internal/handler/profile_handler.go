package handler

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/service"
	"encoding/json"
	"net/http"
)

type ProfileHandler struct {
	service *service.ProfileService
}

func NewProfileHandler(s *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{service: s}
}

// Get обрабатывает GET /whoami — используется hero-секцией
// и командой `whoami` в терминале (см. design doc, секция 8).
func (h *ProfileHandler) Get(w http.ResponseWriter, r *http.Request) {
	profile, err := h.service.Get(r.Context())
	if err != nil {
		mapDomainError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, profile)
}

// Update обрабатывает PUT /whoami (защищён middleware.RequireAuth)
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
	respondJSON(w, http.StatusOK, profile)
}
