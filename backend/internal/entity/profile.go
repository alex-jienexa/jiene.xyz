package entity

import (
	"encoding/json"
	"time"
)

// Profile хранит публичную информацию об авторе блога.
// Таблица содержит только информацию об авторе сайта, то есть
// только одну строку.
type Profile struct {
	ID        int             `db:"id"`
	Name      string          `db:"name"`
	Alias     string          `db:"alias"`
	Role      string          `db:"role"`
	Status    string          `db:"status"`
	Tags      json.RawMessage `db:"tags"`
	Links     json.RawMessage `db:"links"`
	UpdatedAt time.Time       `db:"updated_at"`
}

// ProfileUpdateInput хранит поля, которые доступны для изменения
// в адмике о себе (так как пользователь один и это админ).
// Хранится всё в одном типе ради того, чтобы не было доступа к
// изменению важных или служебеных полей, таких как ID.
type ProfileUpdateInput struct {
	Name   string          `json:"name"`
	Alias  string          `json:"alias"`
	Role   string          `json:"role"`
	Status string          `json:"status"`
	Tags   json.RawMessage `json:"tags"`
	Links  json.RawMessage `json:"links"`
}
