package pixelot

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type Storage struct {
	rdb *redis.Client
}

func NewStorage(rdb *redis.Client) *Storage {
	return &Storage{
		rdb: rdb,
	}
}

func (s *Storage) setPixel(ctx context.Context, p Pixel) error {
	key := fmt.Sprintf("%d:%d", p.X, p.Y)
	return s.rdb.HSet(ctx, "board", key, p.Color).Err()
}

func (s *Storage) getBoard(ctx context.Context) (map[string]string, error) {
	board, err := s.rdb.HGetAll(ctx, "board").Result()
	if err != nil {
		return nil, err
	}
	return board, nil
}
