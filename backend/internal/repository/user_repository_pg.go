package repository

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"context"
	"database/sql"
)

type userPostgresRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userPostgresRepository{db: db}
}

func (r *userPostgresRepository) GetByUsername(ctx context.Context, username string) (*entity.User, error) {
	return nil, nil
}

func (r *userPostgresRepository) GetByID(ctx context.Context, id int) (*entity.User, error) {
	return nil, nil
}

func (r *userPostgresRepository) Create(ctx context.Context, input entity.UserCreateInput) (*entity.User, error) {
	return nil, nil
}
