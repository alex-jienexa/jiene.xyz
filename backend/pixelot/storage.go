package pixelot

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type Storage struct {
	rdb *redis.Client
	ctx context.Context
}

func NewStorage(rdb *redis.Client) *Storage {
	return &Storage{
		rdb: rdb,
		ctx: context.Background(),
	}
}

func (s *Storage) setPixel(p Pixel) {
	key := fmt.Sprintf("%d:%d", p.X, p.Y)
	s.rdb.Set(s.ctx, key, p.Color, 0)
}

func (s *Storage) getBoard() map[string]string {
	keys, _ := s.rdb.Keys(s.ctx, "*:*").Result()

	board := make(map[string]string)
	for _, key := range keys {
		value, _ := s.rdb.Get(s.ctx, key).Result()
		board[key] = value
	}
	return board
}
