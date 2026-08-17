package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
)

type projectPostgresRepository struct {
	db *sql.DB
}

func NewProjectRepository(db *sql.DB) ProjectRepository {
	return &projectPostgresRepository{db: db}
}

func (r *projectPostgresRepository) List(ctx context.Context) ([]entity.Project, error) {
	const query = `
		SELECT id, slug, title, description, status, created_at
		FROM projects
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []entity.Project{}
	for rows.Next() {
		var p entity.Project
		if err := rows.Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Status, &p.CreatedAt); err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, rows.Err()
}

func (r *projectPostgresRepository) GetBySlug(ctx context.Context, slug string) (*entity.Project, error) {
	const query = `
		SELECT id, slug, title, description, status, created_at
		FROM projects
		WHERE slug = $1
	`

	var p entity.Project
	err := r.db.QueryRowContext(ctx, query, slug).Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Status, &p.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *projectPostgresRepository) Create(ctx context.Context, input entity.ProjectCreateInput) (*entity.Project, error) {
	const query = `
		INSERT INTO projects (slug, title, description, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id, slug, title, description, status, created_at
	`

	var p entity.Project
	err := r.db.QueryRowContext(ctx, query, input.Slug, input.Title, input.Description, input.Status).
		Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Status, &p.CreatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, entity.ErrAlreadyExists
		}
		return nil, err
	}
	return &p, nil
}

func (r *projectPostgresRepository) Update(ctx context.Context, slug string, input entity.ProjectUpdateInput) (*entity.Project, error) {
	// Динамическое построение UPDATE: обновляем только переданные поля
	setClauses := []string{}
	args := []interface{}{}
	argPos := 1

	if input.Title != nil {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", argPos))
		args = append(args, *input.Title)
		argPos++
	}
	if input.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argPos))
		args = append(args, *input.Description)
		argPos++
	}
	if input.Status != nil {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argPos))
		args = append(args, *input.Status)
		argPos++
	}

	if len(setClauses) == 0 {
		// Нечего обновлять — не гоняем пустой UPDATE в базу, просто
		// возвращаем текущее состояние.
		return r.GetBySlug(ctx, slug)
	}

	args = append(args, slug)
	query := fmt.Sprintf(`
		UPDATE projects SET %s
		WHERE slug = $%d
		RETURNING id, slug, title, description, status, created_at
	`, strings.Join(setClauses, ", "), argPos)

	var p entity.Project
	err := r.db.QueryRowContext(ctx, query, args...).
		Scan(&p.ID, &p.Slug, &p.Title, &p.Description, &p.Status, &p.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *projectPostgresRepository) Delete(ctx context.Context, slug string) error {
	// ON DELETE SET NULL на articles.project_id (см. миграцию 003) уже
	// гарантирует, что удаление проекта не потянет за собой удаление
	// его статей — они просто "отвязываются" и остаются в chronicle/lab
	// сами по себе.
	res, err := r.db.ExecContext(ctx, `DELETE FROM projects WHERE slug = $1`, slug)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return entity.ErrNotFound
	}
	return nil
}
