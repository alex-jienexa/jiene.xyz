-- projects: метаданные проектов. Статьи опционально ссылаются на проект.

CREATE TABLE projects (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    title       VARCHAR(200) NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    status      VARCHAR(50)  NOT NULL DEFAULT 'concept'
                CHECK (status IN ('in_progress', 'concept', 'completed', 'abandoned')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- CHECK constraint на status — это защита уровня базы данных.
-- Даже если в Go-коде появится баг и кто-то передаст невалидный статус,
-- PostgreSQL откажется сохранить такую строку. Двойная защита:
-- на уровне приложения (entity.ProjectStatus) и на уровне БД.

INSERT INTO projects (slug, title, description, status)
VALUES (
    'pathfinder-ai',
    'Pathfinder AI',
    'ИИ-агент для Pathfinder 2e: анализ игрового стола в реальном времени, принятие тактических решений.',
    'concept'
);
