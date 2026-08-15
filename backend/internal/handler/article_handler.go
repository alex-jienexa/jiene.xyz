package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/service"

	"github.com/go-chi/chi/v5"
)

// ArticleHandler переводит HTTP-запросы в вызовы ArticleService
// и сериализует результат обратно в JSON. Сам handler не содержит
// бизнес-логики — только разбор запроса и формирование ответа.
// Если посмотреть на эти три слоя (handler → service → repository),
// видно как обязанности чётко разделены: каждый слой решает одну задачу.
type ArticleHandler struct {
	service *service.ArticleService
}

func NewArticleHandler(s *service.ArticleService) *ArticleHandler {
	return &ArticleHandler{service: s}
}

// articleListResponse — DTO (Data Transfer Object) для ответа API.
// Это форма JSON, которую видит клиент — она может отличаться
// от внутренней структуры entity.ArticleListItem. Например, здесь
// project превращается из ProjectSlug *string в обычное поле "project".
type articleListResponse struct {
	Data []articleListItemDTO `json:"data"`
	Meta paginationMeta       `json:"meta"`
}

type articleListItemDTO struct {
	Slug               string   `json:"slug"`
	Title              string   `json:"title"`
	Section            string   `json:"section"`
	Kind               string   `json:"kind"`
	Tags               []string `json:"tags"`
	Project            *string  `json:"project,omitempty"`
	IsPublished        bool     `json:"is_published"`
	PublishedAt        *string  `json:"published_at,omitempty"`
	ReadingTimeMinutes int      `json:"reading_time_minutes"`
}

type paginationMeta struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total"`
}

// List возвращает список статей с поддержкой фильтрации по параметрам.
//
// @Summary	Получить список статей
// @Tags	articles
// @Produce	json
// @Param	section	query	string	false "Раздел сайта"		Enums(chronicle,codex,lab)
// @Param	kind 	query 	string	false "Тип контента"		Enums(article,devlog,research,note,essay)
// @Param	tag 	query 	string	false "Slug тега контента"	example(pf2e)
// @Param	page 	query 	int		false "Страница"			default(1)
// @Param	limit 	query 	int		false "Статей на страницу"	default(10) maximum(50)
// @Success	200		{object}		articleListResponse
// @Router	/articles [get]
func (h *ArticleHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := entity.ArticleFilter{
		Section:     entity.ArticleSection(q.Get("section")),
		Kind:        entity.ArticleKind(q.Get("kind")),
		Tag:         q.Get("tag"),
		ProjectSlug: q.Get("project"),
		IsPublished: parseBooleanOrNull("true"),
		Page:        parseIntOrDefault(q.Get("page"), 1),
		Limit:       parseIntOrDefault(q.Get("limit"), 10),
	}

	items, total, err := h.service.List(r.Context(), filter)
	if err != nil {
		mapDomainError(w, err)
		return
	}

	dto := articleListResponse{
		Data: make([]articleListItemDTO, 0, len(items)),
		Meta: paginationMeta{Page: filter.Page, Limit: filter.Limit, Total: total},
	}

	for _, item := range items {
		dto.Data = append(dto.Data, toArticleListItemDTO(item))
	}

	respondJSON(w, http.StatusOK, dto)
}

// ListAdmin возвращает список статей с поддержкой фильтрации по параметрам.
// Фильтры более расширенные - имеется поддержка фильтрации опубликованных статей.
//
// @Summary	Получить список статей (админский фильтр)
// @Tags	articles
// @Produce	json
// @Param	section			query	string	false "Раздел сайта"			Enums(chronicle,codex,lab)
// @Param	kind 			query 	string	false "Тип контента"			Enums(article,devlog,research,note,essay)
// @Param	tag 			query 	string	false "Slug тега контента"		example(pf2e)
// @Param	project 		query 	string	false "Slug проекта стати"		example(pf2e-ml-ai)
// @Param	is_published	query	bool	false "Публикованные статьи?"	default(null)
// @Param	page 			query 	int		false "Страница"				default(1)
// @Param	limit 			query 	int		false "Статей на страницу"		default(10) maximum(50)
// @Success	200		{object}		articleListResponse
// @Router	/admin/articles [get]
func (h *ArticleHandler) ListAdmin(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := entity.ArticleFilter{
		Section:     entity.ArticleSection(q.Get("section")),
		Kind:        entity.ArticleKind(q.Get("kind")),
		Tag:         q.Get("tag"),
		ProjectSlug: q.Get("project"),
		// IsPublished: parseBooleanOrNull("null"),
		Page:  parseIntOrDefault(q.Get("page"), 1),
		Limit: parseIntOrDefault(q.Get("limit"), 10),
	}

	items, total, err := h.service.List(r.Context(), filter)
	if err != nil {
		mapDomainError(w, err)
		return
	}

	dto := articleListResponse{
		Data: make([]articleListItemDTO, 0, len(items)),
		Meta: paginationMeta{Page: filter.Page, Limit: filter.Limit, Total: total},
	}

	for _, item := range items {
		dto.Data = append(dto.Data, toArticleListItemDTO(item))
	}

	respondJSON(w, http.StatusOK, dto)
}

// GetBySlug возвращает полный текст статьи.
//
// @Summary     Получить статью
// @Description Возвращает полный Markdown-контент статьи по её slug.
//
//	Используется страницей статьи на фронтенде.
//
// @Tags		articles
// @Produce	json
// @Param	slug 	path 	string	true	"URL-идентификатор"	example(why-pf2e-is-great-for-ai)
// @Success	200 	{object}	articleDTO
// @Failure 401		{object}	errorResponse	"Нет доступа к статье"
// @Failure	404 	{object}	errorResponse	"Статья не найдена"
// @Failure	500 	{object}	errorResponse	"Внутренняя ошибка сервера"
// @Router	/articles/{slug}	[get]
func (h *ArticleHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	article, err := h.service.GetBySlug(r.Context(), slug)
	if err != nil {
		mapDomainError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toArticleDTO(article))
}

// GetBySlugAdmin возвращает полный текст статьи.
// Позволяет получать неопубликованные статьи.
//
// @Summary     Получить статью, в т.ч. неопубликованную.
// @Description Возвращает полный Markdown-контент статьи по её slug.
//
//	Используется страницей статьи на фронтенде.
//
// @Tags		articles
// @Produce	json
// @Param	slug 	path 	string	true	"URL-идентификатор"	example(why-pf2e-is-great-for-ai)
// @Success	200 	{object}	articleDTO
// @Failure	404 	{object}	errorResponse	"Статья не найдена"
// @Failure	500 	{object}	errorResponse	"Внутренняя ошибка сервера"
// @Router	/admin/articles/{slug}	[get]
func (h *ArticleHandler) GetBySlugAdmin(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	article, err := h.service.GetBySlugAdmin(r.Context(), slug)
	if err != nil {
		mapDomainError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toArticleDTO(article))
}

// Create создаёт новую статью.
//
// @Summary		Создать статью
// @Tags		articles
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		body	body	entity.ArticleCreateInput	true "Данные статьи"
// @Success		201	{object}	articleDTO
// @Failure		400	{object}	errorResponse	"Невалидные данные"
// @Failure		401	{object}	errorResponse	"Требуется авторизация"
// @Failure		409 {object}	errorResponse	"slug уже занят"
// @Router		/articles	[post]
func (h *ArticleHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input entity.ArticleCreateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	article, err := h.service.Create(r.Context(), input)
	if err != nil {
		mapDomainError(w, err)
		return
	}

	respondJSON(w, http.StatusCreated, toArticleDTO(article))
}

// Update изменяет содержание и информацию о статье
//
// @Summary		Изменить статью
// @Tags		articles
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		slug 	path 	string	true	"URL-идентификатор"	example(why-pf2e-is-great-for-ai)
// @Param		body	body	entity.ArticleUpdateInput	true "Данные, которые нужно изменить"
// @Success		200	{object}	articleDTO
// @Failure		400	{object}	errorResponse	"Невалидные данные"
// @Failure		401	{object}	errorResponse	"Требуется авторизация"
// @Failure		404 {object}	errorResponse	"Статья не найдена"
// @Router		/articles/:slug	[put]
func (h *ArticleHandler) Update(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var input entity.ArticleUpdateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	article, err := h.service.Update(r.Context(), slug, input)
	if err != nil {
		mapDomainError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toArticleDTO(article))
}

// Delete удаляет статью из базы данных
//
// @Summary		Удалить статью
// @Tags		articles
// @Accept		json
// @Produce		json
// @Security	BearerAuth
// @Param		slug 	path 	string	true	"URL-идентификатор"	example(why-pf2e-is-great-for-ai)
// @Success		204	{object}	any				"Статья удалена"
// @Failure		401	{object}	errorResponse	"Требуется авторизация"
// @Failure		404 {object}	errorResponse	"Статья не найдена"
// @Router		/articles/:slug	[delete]
func (h *ArticleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	if err := h.service.Delete(r.Context(), slug); err != nil {
		mapDomainError(w, err)
		return
	}

	respondJSON(w, http.StatusNoContent, nil)
}

// Publish публикует статью.
//
// Пока без Swagger-doc, напишу позднее, когда полностью проверится работа админ-панели.
func (h *ArticleHandler) Publish(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	if err := h.service.Publish(r.Context(), slug); err != nil {
		mapDomainError(w, err)
		return
	}

	respondJSON(w, http.StatusNoContent, nil)
}

// --- DTO mapping helpers ---

func toArticleListItemDTO(item entity.ArticleListItem) articleListItemDTO {
	tagNames := make([]string, 0, len(item.Tags))
	for _, t := range item.Tags {
		tagNames = append(tagNames, t.Slug)
	}

	var publishedAt *string
	if item.PublishedAt != nil {
		s := item.PublishedAt.Format("2006-01-02T15:04:05Z07:00")
		publishedAt = &s
	}

	return articleListItemDTO{
		Slug:               item.Slug,
		Title:              item.Title,
		Section:            string(item.Section),
		Kind:               string(item.Kind),
		Tags:               tagNames,
		Project:            item.ProjectSlug,
		IsPublished:        item.IsPublished,
		PublishedAt:        publishedAt,
		ReadingTimeMinutes: item.ReadingTimeMinutes,
	}
}

type articleDTO struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Section     string   `json:"section"`
	Kind        string   `json:"kind"`
	Content     string   `json:"content"`
	Tags        []string `json:"tags"`
	IsPublished bool     `json:"is_published"`
	PublishedAt *string  `json:"published_at,omitempty"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

func toArticleDTO(a *entity.Article) articleDTO {
	tagNames := make([]string, 0, len(a.Tags))
	for _, t := range a.Tags {
		tagNames = append(tagNames, t.Slug)
	}

	var publishedAt *string
	if a.PublishedAt != nil {
		s := a.PublishedAt.Format("2006-01-02T15:04:05Z07:00")
		publishedAt = &s
	}

	return articleDTO{
		Slug:        a.Slug,
		Title:       a.Title,
		Section:     string(a.Section),
		Kind:        string(a.Kind),
		Content:     a.Content,
		Tags:        tagNames,
		IsPublished: a.IsPublished,
		PublishedAt: publishedAt,
		CreatedAt:   a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   a.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func parseIntOrDefault(s string, def int) int {
	if s == "" {
		return def
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return v
}

func parseBooleanOrNull(s string) *bool {
	var ref bool
	switch s {
	case "true":
		ref = true
		return &ref
	case "false":
		ref = false
		return &ref
	default:
		return nil
	}
}
