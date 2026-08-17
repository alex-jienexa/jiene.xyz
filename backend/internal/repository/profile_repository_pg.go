package repository

import (
	"context"
	"database/sql"
	"errors"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
)

type profilePostgresRepository struct {
	db *sql.DB
}

func NewProfileRepository(db *sql.DB) ProfileRepository {
	return &profilePostgresRepository{db: db}
}

func (r *profilePostgresRepository) Get(ctx context.Context) (*entity.Profile, error) {
	const query = `
		SELECT id, name, alias, role, status, tags, links, updated_at
		FROM profile
		LIMIT 1
	`

	var p entity.Profile
	err := r.db.QueryRowContext(ctx, query).Scan(
		&p.ID, &p.Name, &p.Alias, &p.Role, &p.Status, &p.Tags, &p.Links, &p.UpdatedAt,
	)
	// Проверка на ошибки
	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *profilePostgresRepository) Update(ctx context.Context, input entity.ProfileUpdateInput) (*entity.Profile, error) {
	const query = `
		UPDATE profile
		SET name = $1, alias = $2, role = $3, status = $4,
		    tags = $5, links = $6, updated_at = now()
		WHERE id = (SELECT id FROM profile LIMIT 1)
		RETURNING id, name, alias, role, status, tags, links, updated_at
	`

	var p entity.Profile
	err := r.db.QueryRowContext(ctx, query,
		input.Name, input.Alias, input.Role, input.Status,
		input.Tags, input.Links,
	).Scan(
		&p.ID, &p.Name, &p.Alias, &p.Role, &p.Status,
		&p.Tags, &p.Links, &p.UpdatedAt,
	)
	// Проверка на ошибки
	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	return &p, nil
}
