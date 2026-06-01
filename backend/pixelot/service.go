package pixelot

import (
	"context"

	"github.com/gin-gonic/gin"
)

type Service struct {
	storage *Storage
}

func NewService(config Config) *Service {
	return &Service{
		storage: NewStorage(config.RedisClient),
	}
}

func (s *Service) SetPixel(c *gin.Context, p Pixel) error {
	// Todo: проверка на ключи и доступ

	return s.storage.setPixel(c.Request.Context(), p)
}

func (s *Service) GetBoard() (map[string]string, error) {
	return s.storage.getBoard(context.Background())
}
