package service

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/repository"
	"context"
)

type ProfileService struct {
	repo repository.ProfileRepository
}

func NewProfileService(repo repository.ProfileRepository) *ProfileService {
	return &ProfileService{repo: repo}
}

func (s *ProfileService) Get(ctx context.Context) (*entity.Profile, error) {
	return s.repo.Get(ctx)
}

func (s *ProfileService) Update(ctx context.Context, input entity.ProfileUpdateInput) (*entity.Profile, error) {
	return s.repo.Update(ctx, input)
}
