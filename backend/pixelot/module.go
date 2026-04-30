package pixelot

import (
	"github.com/gin-gonic/gin"
)

// Config сохраняет конфигурации модуля. Там же и определяются
// дополнительные инструменты для его работы, например элементы
// Redis или ссылки на базы данных.
type Config struct{}

type Service struct{}

func NewService(config Config) *Service {
	return &Service{}
}

// Mount подключает модуль к роутеру `rg`, используя конфигурацию `config`.
// Роутер `rg` используется для регистрации хендлеров в контексте Gin.
func Mount(rg *gin.RouterGroup, config Config) *Service {
	service := NewService(config)

	// Хендлеры писать тут
	rg.GET("/ping", service.handlePing)

	return service
}
