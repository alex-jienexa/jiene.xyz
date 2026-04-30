package pixelot

import "github.com/gin-gonic/gin"

func (s *Service) handlePing(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}
