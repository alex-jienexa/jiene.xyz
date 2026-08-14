package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
)

type articlePostgresRepository struct {
	db *sql.DB
}

func NewArticleRepository(db *sql.DB) ArticleRepository {
	return &articlePostgresRepository{db: db}
}

// List строит SQL-запрос динамически в зависимости от того,
// какие фильтры заданы. См. ArticleFilter для информации о фильтрах
func (r *articlePostgresRepository) List(ctx context.Context, filter entity.ArticleFilter) ([]entity.ArticleListItem, int, error) {
	conditions := []string{"a.is_published = true"}
	args := []interface{}{}
	argPos := 1

	if filter.Section != "" {
		conditions = append(conditions, fmt.Sprintf("a.section = $%d", argPos))
		args = append(args, filter.Section)
		argPos++
	}
	if filter.Kind != "" {
		conditions = append(conditions, fmt.Sprintf("a.kind = $%d", argPos))
		args = append(args, filter.Kind)
		argPos++
	}
	if filter.ProjectSlug != "" {
		conditions = append(conditions, fmt.Sprintf("p.slug = $%d", argPos))
		args = append(args, filter.ProjectSlug)
		argPos++
	}
	if filter.Tag != "" {
		conditions = append(conditions, fmt.Sprintf(`EXISTS (
			SELECT 1 FROM article_tags at
			JOIN tags t ON t.id = at.tag_id
			WHERE at.article_id = a.id AND t.slug = $%d
		)`, argPos))
		args = append(args, filter.Tag)
		argPos++
	}

	whereClause := strings.Join(conditions, " AND ")

	// Сначала считаем total — нужно для пагинации на фронтенде
	// (чтобы показать "страница 1 из 5").
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM articles a
		LEFT JOIN projects p ON p.id = a.project_id
		WHERE %s
	`, whereClause)

	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 10
	}
	page := filter.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	listQuery := fmt.Sprintf(`
		SELECT a.slug, a.title, a.section, a.kind, a.is_published,
		       a.published_at, p.slug, LENGTH(a.content)
		FROM articles a
		LEFT JOIN projects p ON p.id = a.project_id
		WHERE %s
		ORDER BY a.published_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argPos, argPos+1)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, listQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []entity.ArticleListItem
	for rows.Next() {
		var item entity.ArticleListItem
		var projectSlug sql.NullString
		var contentLength int

		if err := rows.Scan(
			&item.Slug, &item.Title, &item.Section, &item.Kind,
			&item.IsPublished, &item.PublishedAt, &projectSlug, &contentLength,
		); err != nil {
			return nil, 0, err
		}

		if projectSlug.Valid {
			item.ProjectSlug = &projectSlug.String
		}
		// Грубая оценка: 200 слов в минуту, ~5 символов на слово.
		item.ReadingTimeMinutes = max(1, contentLength/1000)

		tags, err := r.getTagsForArticle(ctx, item.Slug)
		if err != nil {
			return nil, 0, err
		}
		item.Tags = tags

		items = append(items, item)
	}

	return items, total, rows.Err()
}

func (r *articlePostgresRepository) GetBySlug(ctx context.Context, slug string) (*entity.Article, error) {
	const query = `
		SELECT a.id, a.slug, a.project_id, a.title, a.section, a.kind,
		       a.content, a.is_published, a.published_at,
		       a.created_at, a.updated_at
		FROM articles a
		WHERE a.slug = $1
	`

	var a entity.Article
	err := r.db.QueryRowContext(ctx, query, slug).Scan(
		&a.ID, &a.Slug, &a.ProjectID, &a.Title, &a.Section, &a.Kind,
		&a.Content, &a.IsPublished, &a.PublishedAt,
		&a.CreatedAt, &a.UpdatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	tags, err := r.getTagsForArticle(ctx, a.Slug)
	if err != nil {
		return nil, err
	}
	a.Tags = tags

	return &a, nil
}

func (r *articlePostgresRepository) Create(ctx context.Context, input entity.ArticleCreateInput) (*entity.Article, error) {
	// Транзакция нужна потому что мы пишем в две таблицы:
	// articles и article_tags. Если вставка тегов упадёт —
	// статья без тегов не должна остаться в базе.
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback() // no-op если уже Commit

	const insertArticle = `
		INSERT INTO articles (slug, project_id, title, section, kind, content, is_published)
		VALUES ($1, $2, $3, $4, $5, $6, false)
		RETURNING id, created_at, updated_at
	`

	var a entity.Article
	a.Slug = input.Slug
	a.ProjectID = input.ProjectID
	a.Title = input.Title
	a.Section = input.Section
	a.Kind = input.Kind
	a.Content = input.Content
	a.IsPublished = false

	err = tx.QueryRowContext(ctx, insertArticle,
		input.Slug, input.ProjectID, input.Title,
		input.Section, input.Kind, input.Content,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)

	if isUniqueViolation(err) {
		return nil, entity.ErrAlreadyExists
	}
	if err != nil {
		return nil, err
	}

	if err := r.attachTags(ctx, tx, a.ID, input.TagSlugs); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	tags, err := r.getTagsForArticle(ctx, a.Slug)
	if err != nil {
		return nil, err
	}
	a.Tags = tags

	return &a, nil
}

func (r *articlePostgresRepository) Update(ctx context.Context, slug string, input entity.ArticleUpdateInput) (*entity.Article, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Динамическое построение UPDATE: обновляем только переданные поля.
	// Указатели в ArticleUpdateInput позволяют отличить "не передано"
	// от "передано пустое значение" — см. комментарий в entity/article.go.
	setClauses := []string{}
	args := []interface{}{}
	argPos := 1

	if input.Title != nil {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", argPos))
		args = append(args, *input.Title)
		argPos++
	}
	if input.Section != nil {
		setClauses = append(setClauses, fmt.Sprintf("section = $%d", argPos))
		args = append(args, *input.Section)
		argPos++
	}
	if input.Kind != nil {
		setClauses = append(setClauses, fmt.Sprintf("kind = $%d", argPos))
		args = append(args, *input.Kind)
		argPos++
	}
	if input.Content != nil {
		setClauses = append(setClauses, fmt.Sprintf("content = $%d", argPos))
		args = append(args, *input.Content)
		argPos++
	}
	if input.IsPublished != nil {
		setClauses = append(setClauses, fmt.Sprintf("is_published = $%d", argPos))
		args = append(args, *input.IsPublished)
		argPos++
		// Когда публикуем впервые — фиксируем published_at.
		if *input.IsPublished {
			setClauses = append(setClauses, "published_at = COALESCE(published_at, now())")
		}
	}
	setClauses = append(setClauses, "updated_at = now()")

	args = append(args, slug)
	query := fmt.Sprintf(`
		UPDATE articles SET %s
		WHERE slug = $%d
		RETURNING id, slug, project_id, title, section, kind, content,
		          is_published, published_at, created_at, updated_at
	`, strings.Join(setClauses, ", "), argPos)

	var a entity.Article
	err = tx.QueryRowContext(ctx, query, args...).Scan(
		&a.ID, &a.Slug, &a.ProjectID, &a.Title, &a.Section, &a.Kind,
		&a.Content, &a.IsPublished, &a.PublishedAt, &a.CreatedAt, &a.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, entity.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if input.TagSlugs != nil {
		if _, err := tx.ExecContext(ctx, `DELETE FROM article_tags WHERE article_id = $1`, a.ID); err != nil {
			return nil, err
		}
		if err := r.attachTags(ctx, tx, a.ID, input.TagSlugs); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	tags, err := r.getTagsForArticle(ctx, a.Slug)
	if err != nil {
		return nil, err
	}
	a.Tags = tags

	return &a, nil
}

func (r *articlePostgresRepository) Delete(ctx context.Context, slug string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM articles WHERE slug = $1`, slug)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return entity.ErrNotFound
	}
	return nil
}

func (r *articlePostgresRepository) Publish(ctx context.Context, slug string) error {
	// Делается углублёненая реализация через SQL-язык.
	const publishQuery = `
		UPDATE articles 
		SET is_published = true, published_at = COALESCE(published_at, now())
		WHERE slug = $1 AND is_published = false
		` // Проверка на публикацию, чтобы не публиковать уже опубликованный пост

	result, err := r.db.ExecContext(ctx, publishQuery)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return entity.ErrNotFound
	}
	return nil
}

// getTagsForArticle — приватный хелпер, переиспользуется в List, GetBySlug, Create, Update.
func (r *articlePostgresRepository) getTagsForArticle(ctx context.Context, slug string) ([]entity.Tag, error) {
	const query = `
		SELECT t.id, t.name, t.slug
		FROM tags t
		JOIN article_tags at ON at.tag_id = t.id
		JOIN articles a ON a.id = at.article_id
		WHERE a.slug = $1
		ORDER BY t.name
	`
	rows, err := r.db.QueryContext(ctx, query, slug)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []entity.Tag
	for rows.Next() {
		var t entity.Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, rows.Err()
}

// attachTags связывает статью с тегами по их слагам.
// Если тег с таким слагом не существует — создаём его.
// Это удобно для админки: автор просто пишет теги текстом,
// не нужно сначала создавать тег отдельным запросом.
func (r *articlePostgresRepository) attachTags(ctx context.Context, tx *sql.Tx, articleID int, tagSlugs []string) error {
	for _, slug := range tagSlugs {
		var tagID int
		err := tx.QueryRowContext(ctx, `
			INSERT INTO tags (name, slug)
			VALUES ($1, $1)
			ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
			RETURNING id
		`, slug).Scan(&tagID)
		if err != nil {
			return err
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO article_tags (article_id, tag_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, articleID, tagID)
		if err != nil {
			return err
		}
	}
	return nil
}
