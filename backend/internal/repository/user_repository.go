package repository

import (
	"context"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
)

// UserRepository — интерфейс доступа к БД пользователей.
type UserRepository interface {
	GetByUsername(ctx context.Context, username string) (*entity.User, error)
	GetByID(ctx context.Context, id int) (*entity.User, error)
	Create(ctx context.Context, input entity.UserCreateInput) (*entity.User, error)
}
