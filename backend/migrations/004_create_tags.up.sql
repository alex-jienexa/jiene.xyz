-- tags: словарь тегов. Имя и slug совпадают для простоты на старте —
-- в будущем можно разрешить name с пробелами/заглавными, а slug
-- оставить технической версией.

CREATE TABLE tags (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);
