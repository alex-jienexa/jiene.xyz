package pixelot

import "github.com/gin-gonic/gin"

func (s *Service) handlePing(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

func (s *Service) handlePixel(c *gin.Context) {
	var p Pixel
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	if err := s.SetPixel(p); err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "OK",
	})
}

func (s *Service) handleBoard(c *gin.Context) {
	board := s.GetBoard()

	c.JSON(200, gin.H{
		"board": board,
	})
}
