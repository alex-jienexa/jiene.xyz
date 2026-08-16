package entity

import "time"

// ProjectStatus — перечисление возможных статусов проекта.
// Используем типизированные константы вместо магических строк.
type ProjectStatus string

const (
	ProjectStatusInProgress ProjectStatus = "in_progress"
	ProjectStatusConcept    ProjectStatus = "concept"
	ProjectStatusCompleted  ProjectStatus = "completed"
	ProjectStatusAbandoned  ProjectStatus = "abandoned"
)

// Project — метаданные проекта.
// Статьи ссылаются на проект через project_id.
type Project struct {
	ID          int           `db:"id"`
	Slug        string        `db:"slug"` // URL-идентификатор: "pathfinder-ai"
	Title       string        `db:"title"`
	Description string        `db:"description"`
	Status      ProjectStatus `db:"status"`
	CreatedAt   time.Time     `db:"created_at"`
}

// ProjectCreateInput — данные для создания нового проекта.
// Slug необязателен — если не указан, сервис сгенерирует его из Title
type ProjectCreateInput struct {
	Slug        string        `json:"slug"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Status      ProjectStatus `json:"status"`
}

// ProjectUpdateInput — данные для обновления проекта.
// Pointer-поля означают "опционально": если nil — не обновлять.
type ProjectUpdateInput struct {
	Title       *string        `json:"title"`
	Description *string        `json:"description"`
	Status      *ProjectStatus `json:"status"`
}
