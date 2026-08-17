-- users: учётные записи авторов сайта. Сейчас используется только
-- одна строка (Alex), но вынесена в отдельную таблицу, а не оставлена
-- как ADMIN_PASSWORD_HASH в переменной окружения — это позволяет
-- в будущем добавить второго автора вставкой одной строки, без
-- миграции схемы и без правки auth-хендлера.
--
-- Публичной регистрации нет и не планируется автоматически на данный
-- момент. Пользователи создаются вручную через `go run ./cmd/createuser`.

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'admin'
                  CHECK (role IN ('admin')), -- Временная мера, в будущем будут отдельные роли
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
