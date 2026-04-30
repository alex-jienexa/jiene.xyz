package pixelot

import (
	"github.com/gin-gonic/gin"
)

// Mount подключает модуль к роутеру `rg`, используя конфигурацию `config`.
// Роутер `rg` используется для регистрации хендлеров в контексте Gin.
func Mount(rg *gin.RouterGroup, config Config) *Service {
	service := NewService(config)

	// Хендлеры писать тут
	rg.GET("/ping", service.handlePing)
	rg.GET("/board", service.handleBoard)

	rg.POST("/pixel", service.handlePixel)

	return service
}
