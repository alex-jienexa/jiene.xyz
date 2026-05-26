package pixelot

import "github.com/redis/go-redis/v9"

type Pixel struct {
	X     int    `json:"x"`
	Y     int    `json:"y"`
	Color string `json:"color"`
}

// Config сохраняет конфигурации модуля. Там же и определяются
// дополнительные инструменты для его работы, например элементы
// Redis или ссылки на базы данных.
type Config struct {
	RedisClient *redis.Client
}
