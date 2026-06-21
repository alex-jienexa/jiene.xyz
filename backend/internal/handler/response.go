package handler

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"encoding/json"
	"errors"
	"net/http"
)

// respondJSON и respondError — общие хелперы для всех handler'ов.
// Без них каждый handler дублировал бы w.Header().Set(...) и
// json.NewEncoder(w).Encode(...) — мелкое, но раздражающее повторение.
func respondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		json.NewEncoder(w).Encode(payload)
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

// mapDomainError — переводит доменную ошибку (entity.ErrNotFound и т.п.)
// в правильный HTTP-статус. Это единственное место в проекте, которое
// знает соответствие "доменная ошибка → HTTP код". Если завтра
// добавится новый тип ошибки — меняется только эта функция.
func mapDomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, entity.ErrNotFound):
		respondError(w, http.StatusNotFound, "not found")
	case errors.Is(err, entity.ErrAlreadyExists):
		respondError(w, http.StatusConflict, "already exists")
	case errors.Is(err, entity.ErrInvalidInput):
		respondError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, entity.ErrUnauthorized):
		respondError(w, http.StatusUnauthorized, "unauthorized")
	default:
		respondError(w, http.StatusInternalServerError, "internal server error")
	}
}
