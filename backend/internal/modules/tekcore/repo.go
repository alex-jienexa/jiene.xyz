package tekcore

import "context"

// ApplicationRepository — порт хранения заявок. Реализация по умолчанию — файл (repo_file.go);
// хост может подставить свой адаптер поверх БД, не меняя модуль.
type ApplicationRepository interface {
	Add(ctx context.Context, a Application) error
	List(ctx context.Context) ([]Application, error)
}

// ContentSource — порт источника контента лендинга (метрики, районы, товары).
// Контент отдаётся как готовый JSON-документ: бэкенд его не интерпретирует.
type ContentSource interface {
	Load(ctx context.Context) ([]byte, error)
}
