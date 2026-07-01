-- profile: ровно одна строка с данными автора.
-- Используется hero-секцией главной страницы и командой `whoami` в терминале.

CREATE TABLE profile (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    alias       VARCHAR(50)  NOT NULL,
    role        VARCHAR(200) NOT NULL DEFAULT '',
    status      VARCHAR(300) NOT NULL DEFAULT '',
    tags        JSONB        NOT NULL DEFAULT '[]',
    links       JSONB        NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Сразу вставляем стартовую запись, чтобы GET /whoami работал
-- с первого запуска, а не возвращал 404.
INSERT INTO profile (name, alias, role, status, tags, links)
VALUES (
    'Alex Jienexa',
    'jiene',
    'Searching myself in process...',
    'Мой гриммуар в процессе разработки, stay tuned...',
    '["ML/AI", "Golang", "Solid.js", "PF2e/SF2e"]',
    '{"github": "https://github.com/alex-jienexa", "email": "alexjienexa+xyz@gmail.com"}'
);
