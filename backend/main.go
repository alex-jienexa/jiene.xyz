package main

import (
	"net/http"
	"os"

	"jiene.xyz/backend/pixelot"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func main() {
	router := gin.Default()
	api := router.Group("/api") // Когда будет замена версий API, то надо сделать прослойки для api/{v1, v2, ...}

	// === Создание маршрутов для pixelot ===
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	redis := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	pixelotGroup := api.Group("/pixel")
	pixelot.Mount(pixelotGroup, pixelot.Config{
		RedisClient: redis,
	})

	http.ListenAndServe(":8080", router)
}
