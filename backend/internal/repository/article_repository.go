package repository

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"context"
)

// ArticleRepository — интерфейс доступа к статьям.
type ArticleRepository interface {
	List(ctx context.Context, filter entity.ArticleFilter) ([]entity.ArticleListItem, int, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Article, error)
	Create(ctx context.Context, input entity.ArticleCreateInput) (*entity.Article, error)
	Update(ctx context.Context, slug string, input entity.ArticleUpdateInput) (*entity.Article, error)
	Delete(ctx context.Context, slug string) error
}
