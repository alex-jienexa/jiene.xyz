package repository

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"context"
)

type ProjectRepository interface {
	List(ctx context.Context) ([]entity.Project, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Project, error)
	Create(ctx context.Context, input entity.ProjectCreateInput) (*entity.Project, error)
	Update(ctx context.Context, slug string, input entity.ProjectUpdateInput) (*entity.Project, error)
	Delete(ctx context.Context, slug string) error
}
