package main

import (
	"backend/pixelot"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	api := router.Group("/api") // Когда будет замена версий API, то надо сделать прослойки для api/{v1, v2, ...}

	pixelotGroup := api.Group("/pixel")
	pixelot.Mount(pixelotGroup, pixelot.Config{})

	http.ListenAndServe(":8080", router)
}
