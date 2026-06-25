package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"unicode"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/repository"
)

// ArticleService содержит бизнес-логику работы со статьями.
// В отличие от repository, который просто читает/пишет данные,
// service знает ПРАВИЛА: как генерировать slug, какие поля
// обязательны, как валидировать входные данные перед записью.
//
// Зависит от repository.ArticleRepository — интерфейса, а не
// конкретной PostgreSQL-реализации. Это позволяет в тестах
// подставить fake-репозиторий без поднятия реальной БД.
type ArticleService struct {
	repo repository.ArticleRepository
}

func NewArticleService(repo repository.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

func (s *ArticleService) List(ctx context.Context, filter entity.ArticleFilter) ([]entity.ArticleListItem, int, error) {
	// Бизнес-правило: лимит не может быть больше 50,
	// чтобы случайный ?limit=10000 не положил базу данных.
	if filter.Limit > 50 {
		filter.Limit = 50
	}
	return s.repo.List(ctx, filter)
}

func (s *ArticleService) GetBySlug(ctx context.Context, slug string) (*entity.Article, error) {
	return s.repo.GetBySlug(ctx, slug)
}

func (s *ArticleService) Create(ctx context.Context, input entity.ArticleCreateInput) (*entity.Article, error) {
	if err := s.validateCreateInput(input); err != nil {
		return nil, err
	}

	// Бизнес-правило: если автор не указал slug — генерируем
	// его из заголовка автоматически.
	if input.Slug == "" {
		input.Slug = slugify(input.Title)
	} else {
		input.Slug = slugify(input.Slug)
	}

	return s.repo.Create(ctx, input)
}

func (s *ArticleService) Update(ctx context.Context, slug string, input entity.ArticleUpdateInput) (*entity.Article, error) {
	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		return nil, fmt.Errorf("%w: title cannot be empty", entity.ErrInvalidInput)
	}
	return s.repo.Update(ctx, slug, input)
}

func (s *ArticleService) Delete(ctx context.Context, slug string) error {
	return s.repo.Delete(ctx, slug)
}

func (s *ArticleService) validateCreateInput(input entity.ArticleCreateInput) error {
	if strings.TrimSpace(input.Title) == "" {
		return fmt.Errorf("%w: title is required", entity.ErrInvalidInput)
	}
	if input.Section == "" {
		return fmt.Errorf("%w: section is required", entity.ErrInvalidInput)
	}
	if input.Kind == "" {
		return fmt.Errorf("%w: kind is required", entity.ErrInvalidInput)
	}
	return nil
}

var nonAlphanumeric = regexp.MustCompile(`[^a-z0-9]+`)

// slugify превращает произвольный текст в URL-безопасную строку.
// "Почему PF2e — идеальный полигон" → "pochemu-pf2e-idealnyy-poligon"
//
// Это простая реализация без транслитерации кириллицы для краткости —
// в качестве упражнения предлагаю добавить транслитерацию самостоятельно
// (см. секцию "что изучить" после кода).
func slugify(s string) string {
	s = strings.ToLower(s)
	var b strings.Builder
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
		} else {
			b.WriteRune(' ')
		}
	}
	result := nonAlphanumeric.ReplaceAllString(b.String(), "-")
	return strings.Trim(result, "-")
}
