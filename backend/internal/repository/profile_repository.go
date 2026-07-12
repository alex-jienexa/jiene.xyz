package repository

import (
	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"context"
)

// ProfileRepository — интерфейс доступа к данным профиля.
//
// service зависит от ЭТОГО
// интерфейса, а не от конкретной реализации на PostgreSQL.
// Если понадобиться переехать на другую базу данных, то
// изменяются только директория реализации репозитория
// (из `pg` на другой, например `mysql`), другие слои не трогаются
// вооюбще.
//
// context.Context передаётся первым аргументом во все методы —
// это стандарт в Go для распространения отмены запроса, таймаутов
// и значений между слоями (например, request ID для логирования).
type ProfileRepository interface {
	Get(ctx context.Context) (*entity.Profile, error)
	Update(ctx context.Context, input entity.ProfileUpdateInput) (*entity.Profile, error)
}
