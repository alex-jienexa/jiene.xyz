-- article_tags: связующая таблица many-to-many между articles и tags.

CREATE TABLE article_tags (
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id     INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- ON DELETE CASCADE здесь принципиально отличается от articles→projects:
-- если статья удалена, связи с тегами теряют смысл и должны исчезнуть
-- автоматически. Если тег удалён — тоже логично убрать связь, а не
-- оставлять "осиротевшую" запись с несуществующим tag_id.

-- Составной первичный ключ (article_id, tag_id) гарантирует,
-- что одна и та же пара "статья-тег" не может быть вставлена дважды —
-- защита на уровне БД, дублирующая логику ON CONFLICT в repository.
