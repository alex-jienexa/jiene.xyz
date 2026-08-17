package repository

import (
	"errors"

	"github.com/lib/pq"
)

// isUniqueViolation проверяет код ошибки PostgreSQL для нарушения
// уникального constraint (23505). Это единственное место в проекте,
// которое знает о специфике pq-драйвера — изолировано внутри repository.
// Проверка идёт через lib/pq, чтобы надёжно сравнить ошибку
// "запись существует" от других ошибок БД.
func isUniqueViolation(err error) bool {
	var pqErr *pq.Error
	if errors.As(err, &pqErr) {
		return pqErr.Code == "23505"
	}
	return false

}
