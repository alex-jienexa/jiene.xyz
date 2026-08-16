package handler

import (
	"encoding/json"
	"net/http"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/service"

	"github.com/go-chi/chi/v5"
)

// ProjectHandler переводит HTTP-запросы в вызовы ProjectService.
// Симметрично ArticleHandler: тот же принцип разделения слоёв.
type ProjectHandler struct {
	service *service.ProjectService
}

func NewProjectHandler(s *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{service: s}
}

type projectDTO struct {
	ID          int    `json:"id"`
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
}

func toProjectDTO(p *entity.Project) projectDTO {
	return projectDTO{
		ID:          p.ID,
		Slug:        p.Slug,
		Title:       p.Title,
		Description: p.Description,
		Status:      string(p.Status),
		CreatedAt:   p.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// List возвращает все проекты.
//
// @Summary	Получить список проектов
// @Tags	projects
// @Produce	json
// @Success	200	{array}	projectDTO
// @Router	/projects [get]
func (h *ProjectHandler) List(w http.ResponseWriter, r *http.Request) {
	projects, err := h.service.List(r.Context())
	if err != nil {
		mapDomainError(w, err)
		return
	}

	dto := make([]projectDTO, 0, len(projects))
	for i := range projects {
		dto = append(dto, toProjectDTO(&projects[i]))
	}
	respondJSON(w, http.StatusOK, dto)
}

// GetBySlug возвращает один проект по slug.
//
// @Summary	Получить проект
// @Tags	projects
// @Produce	json
// @Param	slug path string true "URL-идентификатор проекта"
// @Success	200	{object}	projectDTO
// @Failure	404	{object}	errorResponse
// @Router	/projects/{slug} [get]
func (h *ProjectHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	project, err := h.service.GetBySlug(r.Context(), slug)
	if err != nil {
		mapDomainError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, toProjectDTO(project))
}

// Create создаёт новый проект. Защищён RequireAuth в роутере.
//
// @Summary		Создать проект
// @Tags		projects
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		body	body	entity.ProjectCreateInput	true	"Данные проекта"
// @Success		201	{object}	projectDTO
// @Failure		400	{object}	errorResponse
// @Failure		401	{object}	errorResponse
// @Router		/projects [post]
func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input entity.ProjectCreateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	project, err := h.service.Create(r.Context(), input)
	if err != nil {
		mapDomainError(w, err)
		return
	}
	respondJSON(w, http.StatusCreated, toProjectDTO(project))
}

// Update изменяет проект. Защищён RequireAuth в роутере.
//
// @Summary		Изменить проект
// @Tags		projects
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		slug	path	string						true	"URL-идентификатор проекта"
// @Param		body	body	entity.ProjectUpdateInput	true	"Данные, которые нужно изменить"
// @Success		200	{object}	projectDTO
// @Failure		400	{object}	errorResponse
// @Failure		404	{object}	errorResponse
// @Router		/projects/{slug} [put]
func (h *ProjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var input entity.ProjectUpdateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	project, err := h.service.Update(r.Context(), slug, input)
	if err != nil {
		mapDomainError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, toProjectDTO(project))
}

// Delete удаляет проект. Защищён RequireAuth в роутере.
// Статьи, ссылавшиеся на проект, не удаляются (project_id -> NULL,
// см. миграцию 003) — они просто перестают быть частью кодекса проекта.
//
// @Summary		Удалить проект
// @Tags		projects
// @Security	BearerAuth
// @Param		slug	path	string	true	"URL-идентификатор проекта"
// @Success		204
// @Failure		404	{object}	errorResponse
// @Router		/projects/{slug} [delete]
func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	if err := h.service.Delete(r.Context(), slug); err != nil {
		mapDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
