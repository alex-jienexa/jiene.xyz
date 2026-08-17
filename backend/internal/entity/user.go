package entity

import "time"

// UserRole пока имеет только одно реальное значение ("admin"), но заведён
// как отдельный тип (а не bool is_admin), потому что заранее закладываем
// возможность появления, например, "editor" — роли с более узкими правами,
// без миграции колонок в будущем.
type UserRole string

const (
	RoleAdmin UserRole = "admin"
)

// User является учётной записью автора сайта. Так как в системе по
// факту один пользователь, то это может быть избыточно, но есть
// задел на будущее в виде нескольких пользователей на сайте (как
// редакторов, так и обычных пользователей). Для добавления нового
// пользователя необходимо лишь добавить строку в таблицу БД `users`.
type User struct {
	ID           int       `db:"id"`
	Username     string    `db:"username"`
	PasswordHash string    `db:"password_hash"`
	Role         UserRole  `db:"role"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

// UserCreateInput является структурой полей для создания пользователя.
type UserCreateInput struct {
	Username     string
	PasswordHash string
	Role         UserRole
}
