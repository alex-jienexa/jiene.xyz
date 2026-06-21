package entity

import "errors"

// Доменные ошибки. Repository и Service возвращают именно их,
// а не "сырые" ошибки PostgreSQL (sql.ErrNoRows и т.п).
//
// Handler проверяет `errors.Is(err, entity.ErrNotFound)` и решает,
// какой HTTP-статус вернуть — 404, 409, 500. Сам репозиторий
// никогда не знает о существовании HTTP.

var (
	ErrNotFound      = errors.New("resource not found")
	ErrAlreadyExists = errors.New("resource already exists")
	ErrInvalidInput  = errors.New("invalid input")
	ErrUnauthorized  = errors.New("unauthorized")
)
