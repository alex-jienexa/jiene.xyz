package entity

import "time"

// ArticleSection — навигационный раздел сайта.
// Отвечает на вопрос "где на сайте живёт эта запись".
type ArticleSection string

const (
	SectionChronicle ArticleSection = "chronicle" // Последние записи
	SectionCodex     ArticleSection = "codex"     // Завершённые проекты
	SectionLab       ArticleSection = "lab"       // Эксперименты и идеи
)

// ArticleKind — природа контента.
// Отвечает на вопрос "что это такое по сути".
// Независима от Section: запись может быть section=chronicle, kind=research.
type ArticleKind string

const (
	KindArticle  ArticleKind = "article"
	KindDevlog   ArticleKind = "devlog"
	KindResearch ArticleKind = "research"
	KindNote     ArticleKind = "note"
	KindEssay    ArticleKind = "essay"
)

// Article — полная структура статьи из базы данных.
type Article struct {
	ID          int            `db:"id"`
	Slug        string         `db:"slug"`
	ProjectID   *int           `db:"project_id"` // nullable: статья может не принадлежать проекту
	Title       string         `db:"title"`
	Section     ArticleSection `db:"section"`
	Kind        ArticleKind    `db:"kind"`
	Content     string         `db:"content"` // Markdown
	IsPublished bool           `db:"is_published"`
	PublishedAt *time.Time     `db:"published_at"` // nullable: черновик не имеет даты публикации
	CreatedAt   time.Time      `db:"created_at"`
	UpdatedAt   time.Time      `db:"updated_at"`

	// Поля из JOIN — не хранятся в таблице articles напрямую.
	// Заполняются репозиторием при необходимости.
	Tags    []Tag    `db:"-"`
	Project *Project `db:"-"`
}

// ArticleListItem — облегчённая версия для списков.
// Не содержит Content — зачем грузить весь Markdown если нужны только превью?
type ArticleListItem struct {
	Slug               string         `db:"slug"`
	Title              string         `db:"title"`
	Section            ArticleSection `db:"section"`
	Kind               ArticleKind    `db:"kind"`
	IsPublished        bool           `db:"is_published"`
	PublishedAt        *time.Time     `db:"published_at"`
	ReadingTimeMinutes int            `db:"-"` // вычисляется из длины контента
	Tags               []Tag          `db:"-"`
	ProjectSlug        *string        `db:"-"` // slug проекта для ответа API
}

// ArticleCreateInput — данные для создания статьи из API.
type ArticleCreateInput struct {
	Slug      string         `json:"slug"`
	ProjectID *int           `json:"project_id"`
	Title     string         `json:"title"`
	Section   ArticleSection `json:"section"`
	Kind      ArticleKind    `json:"kind"`
	Content   string         `json:"content"`
	TagSlugs  []string       `json:"tags"` // ["pf2e", "ml"] — слаги тегов
}

// ArticleUpdateInput — данные для обновления статьи.
// Pointer-поля означают "опционально": если nil — не обновлять.
type ArticleUpdateInput struct {
	Title       *string         `json:"title"`
	Section     *ArticleSection `json:"section"`
	Kind        *ArticleKind    `json:"kind"`
	Content     *string         `json:"content"`
	IsPublished *bool           `json:"is_published"`
	TagSlugs    []string        `json:"tags"`
}

// ArticleFilter — параметры фильтрации для GET /articles.
type ArticleFilter struct {
	Section     ArticleSection
	Kind        ArticleKind
	Tag         string
	ProjectSlug string
	IsPublished *bool
	Page        int
	Limit       int
}

// Tag — словарная запись тега.
type Tag struct {
	ID   int    `db:"id"`
	Name string `db:"name"`
	Slug string `db:"slug"`
}
