package pixelot

type Service struct {
	storage *Storage
}

func NewService(config Config) *Service {
	return &Service{
		storage: NewStorage(config.RedisClient),
	}
}

func (s *Service) SetPixel(p Pixel) error {
	// Todo: проверка на ключи и доступ

	s.storage.setPixel(p)
	return nil
}

func (s *Service) GetBoard() map[string]string {
	return s.storage.getBoard()
}
