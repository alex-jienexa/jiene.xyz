-- articles: основной контент сайта — статьи, devlog, исследования.

CREATE TABLE articles (
    id            SERIAL PRIMARY KEY,
    slug          VARCHAR(200) NOT NULL UNIQUE,
    project_id    INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    title         VARCHAR(300) NOT NULL,
    section       VARCHAR(50)  NOT NULL
                  CHECK (section IN ('chronicle', 'codex', 'lab')),
    kind          VARCHAR(50)  NOT NULL
                  CHECK (kind IN ('article', 'devlog', 'research', 'note', 'essay')),
    content       TEXT         NOT NULL DEFAULT '',
    is_published  BOOLEAN      NOT NULL DEFAULT false,
    published_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ON DELETE SET NULL: если проект удалён, статья не удаляется вместе
-- с ним — она просто становится "независимой" (project_id = NULL).
-- Это осознанный выбор: контент важнее метаданных проекта.

-- Индекс под самый частый запрос: список опубликованных статей
-- в разделе, отсортированный по дате публикации (см. repository List).
CREATE INDEX idx_articles_section_published
    ON articles (section, is_published, published_at DESC);

CREATE INDEX idx_articles_project ON articles (project_id);
