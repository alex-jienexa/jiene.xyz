package repository

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"context"
	"database/sql"
	"errors"
)

type userPostgresRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userPostgresRepository{db: db}
}

func (r *userPostgresRepository) GetByUsername(ctx context.Context, username string) (*entity.User, error) {
	const query = `
		SELECT id, username, password_hash, role, created_at, updated_at
		FROM users
		WHERE username = $1
	`

	var u entity.User
	err := r.db.QueryRowContext(ctx, query, username).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *userPostgresRepository) GetByID(ctx context.Context, id int) (*entity.User, error) {
	const query = `
		SELECT id, username, password_hash, role, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var u entity.User
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *userPostgresRepository) Create(ctx context.Context, input entity.UserCreateInput) (*entity.User, error) {
	const query = `
		INSERT INTO users (username, password_hash, role)
		VALUES ($1, $2, $3)
		RETURNING id, username, password_hash, role, created_at, updated_at
	`

	var u entity.User
	err := r.db.QueryRowContext(ctx, query, input.Username, input.PasswordHash, input.Role).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		// Проверка на уникальность с помощью Posgres кода
		if isUniqueViolation(err) {
			return nil, entity.ErrAlreadyExists
		}
		return nil, err
	}
	return &u, nil
}
