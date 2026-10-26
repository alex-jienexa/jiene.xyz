package tekcore

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type submitRequest struct {
	Name     string `json:"name"`
	District string `json:"district"`
	Reason   string `json:"reason"`
	Consent  bool   `json:"consent"`
}

type applicationDTO struct {
	Name     string    `json:"name"`
	District string    `json:"district"`
	Reason   string    `json:"reason"`
	Consent  bool      `json:"consent"`
	At       time.Time `json:"at"`
}

type handler struct {
	svc *Service
	log *slog.Logger
}

// newHandler собирает маршруты БЕЗ префикса: префикс (/api/nanograd/tekcore) задаёт хост при монтировании.
func newHandler(svc *Service, adminAuth func(http.Handler) http.Handler, log *slog.Logger) http.Handler {
	h := &handler{svc: svc, log: log}
	r := chi.NewRouter()
	r.Get("/content", h.content)
	r.Post("/applications", h.submit)
	r.Handle("GET /applications", adminAuth(http.HandlerFunc(h.list)))
	return r
}

func (h *handler) content(w http.ResponseWriter, r *http.Request) {
	b, err := h.svc.Content(r.Context())
	if err != nil {
		h.fail(w, "load content", err)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	_, _ = w.Write(b)
}

func (h *handler) submit(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
	var req submitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad json"})
		return
	}
	err := h.svc.Submit(r.Context(), SubmitInput{Name: req.Name, District: req.District, Reason: req.Reason, Consent: req.Consent})
	switch {
	case errors.Is(err, ErrValidation):
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": "validation failed"})
	case err != nil:
		h.fail(w, "save application", err)
	default:
		writeJSON(w, http.StatusCreated, map[string]string{"status": "saved"})
	}
}

func (h *handler) list(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.Applications(r.Context())
	if err != nil {
		h.fail(w, "list applications", err)
		return
	}
	out := make([]applicationDTO, 0, len(items))
	for _, a := range items {
		out = append(out, applicationDTO{Name: a.Name, District: a.District, Reason: a.Reason, Consent: a.Consent, At: a.At})
	}
	writeJSON(w, http.StatusOK, map[string]any{"count": len(out), "items": out})
}

// fail логирует причину на сервере, а клиенту отдаёт общий ответ — детали хранилища наружу не уходят.
func (h *handler) fail(w http.ResponseWriter, what string, err error) {
	h.log.Error("tekcore: "+what, "err", err)
	writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}
