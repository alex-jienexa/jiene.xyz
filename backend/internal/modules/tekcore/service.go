package tekcore

import (
	"context"
	"time"
)

// Service — сценарии использования модуля. Зависит только от портов.
type Service struct {
	apps    ApplicationRepository
	content ContentSource
	now     func() time.Time // подменяется в тестах
}

func NewService(apps ApplicationRepository, content ContentSource) *Service {
	return &Service{apps: apps, content: content, now: time.Now}
}

type SubmitInput struct {
	Name, District, Reason string
	Consent                bool
}

func (s *Service) Content(ctx context.Context) ([]byte, error) { return s.content.Load(ctx) }

func (s *Service) Submit(ctx context.Context, in SubmitInput) error {
	a, err := NewApplication(in.Name, in.District, in.Reason, in.Consent, s.now().UTC())
	if err != nil {
		return err
	}
	return s.apps.Add(ctx, a)
}

func (s *Service) Applications(ctx context.Context) ([]Application, error) {
	return s.apps.List(ctx)
}
