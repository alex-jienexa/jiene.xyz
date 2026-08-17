package service

import (
	"context"
	"fmt"
	"strings"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/repository"
	"alex-jienexa/jiene.xyz/backend/pkg/slug"
)

// ProjectService содержит бизнес-логику работы с проектами:
// валидацию и генерацию slug.
type ProjectService struct {
	repo repository.ProjectRepository
}

func NewProjectService(repo repository.ProjectRepository) *ProjectService {
	return &ProjectService{repo: repo}
}

func (s *ProjectService) List(ctx context.Context) ([]entity.Project, error) {
	return s.repo.List(ctx)
}

func (s *ProjectService) GetBySlug(ctx context.Context, slugValue string) (*entity.Project, error) {
	return s.repo.GetBySlug(ctx, slugValue)
}

func (s *ProjectService) Create(ctx context.Context, input entity.ProjectCreateInput) (*entity.Project, error) {
	if strings.TrimSpace(input.Title) == "" {
		return nil, fmt.Errorf("%w: title is required", entity.ErrInvalidInput)
	}
	if input.Status == "" {
		// Дефолт совпадает с тем, что уже используется в seed-данных
		// миграции 002 ("concept") — новый проект по умолчанию
		// считается идеей, а не завершённым делом.
		input.Status = entity.ProjectStatusConcept
	}
	if !isValidProjectStatus(input.Status) {
		return nil, fmt.Errorf("%w: invalid status %q", entity.ErrInvalidInput, input.Status)
	}

	if input.Slug == "" {
		input.Slug = slug.Generate(input.Title)
	} else {
		input.Slug = slug.Generate(input.Slug)
	}

	return s.repo.Create(ctx, input)
}

func (s *ProjectService) Update(ctx context.Context, slugValue string, input entity.ProjectUpdateInput) (*entity.Project, error) {
	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		return nil, fmt.Errorf("%w: title cannot be empty", entity.ErrInvalidInput)
	}
	if input.Status != nil && !isValidProjectStatus(*input.Status) {
		return nil, fmt.Errorf("%w: invalid status %q", entity.ErrInvalidInput, *input.Status)
	}
	return s.repo.Update(ctx, slugValue, input)
}

func (s *ProjectService) Delete(ctx context.Context, slugValue string) error {
	return s.repo.Delete(ctx, slugValue)
}

// isValidProjectStatus дублирует список статусов из CHECK-constraint
// в миграции 002 — та же защита, но на уровне приложения, чтобы
// показать пользователю осмысленную ошибку 400 вместо "сырой" ошибки
// PostgreSQL при нарушении CHECK.
func isValidProjectStatus(status entity.ProjectStatus) bool {
	switch status {
	case entity.ProjectStatusInProgress, entity.ProjectStatusConcept,
		entity.ProjectStatusCompleted, entity.ProjectStatusAbandoned:
		return true
	default:
		return false
	}
}
