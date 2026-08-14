package service

import (
	"context"
	"fmt"
	"strings"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/repository"
	"alex-jienexa/jiene.xyz/backend/pkg/slug"
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

func (s *ArticleService) GetBySlugAdmin(ctx context.Context, slug string) (*entity.Article, error) {
	return s.repo.GetBySlugAdmin(ctx, slug)
}

func (s *ArticleService) Create(ctx context.Context, input entity.ArticleCreateInput) (*entity.Article, error) {
	if err := s.validateCreateInput(input); err != nil {
		return nil, err
	}

	// Бизнес-правило: если автор не указал slug — генерируем
	// его из заголовка автоматически.
	if input.Slug == "" {
		input.Slug = slug.Generate(input.Title)
	} else {
		input.Slug = slug.Generate(input.Slug)
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

func (s *ArticleService) Publish(ctx context.Context, slug string) error {
	// TODO: решить, нужно ли вообще возвращать статью при её публикации?
	return s.repo.Publish(ctx, slug)
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
