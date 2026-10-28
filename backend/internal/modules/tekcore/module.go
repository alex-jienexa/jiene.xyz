package tekcore

import (
	"errors"
	"log/slog"
	"net/http"
)

// Config — всё, что модуль берёт у хоста.
type Config struct {
	ContentPath string // JSON с метриками, районами и товарами (обязательно)
	AppsPath    string // файл заявок; нужен, если не задан Applications

	// Applications — необязательно: свой адаптер хранения (например, поверх БД хоста).
	Applications ApplicationRepository

	// AdminAuth — middleware админ-доступа хоста (обязательно). Без него список заявок
	// с персональными данными не должен существовать, поэтому New вернёт ошибку.
	AdminAuth func(http.Handler) http.Handler

	Logger *slog.Logger
}

// New возвращает http.Handler с маршрутами GET /content, POST /applications, GET /applications
// (без префикса — смонтируйте через http.StripPrefix).
func New(cfg Config) (http.Handler, error) {
	if cfg.AdminAuth == nil {
		return nil, errors.New("tekcore: Config.AdminAuth is required")
	}
	if cfg.ContentPath == "" {
		return nil, errors.New("tekcore: Config.ContentPath is required")
	}
	apps := cfg.Applications
	if apps == nil {
		if cfg.AppsPath == "" {
			return nil, errors.New("tekcore: set Config.Applications or Config.AppsPath")
		}
		apps = NewFileApplications(cfg.AppsPath)
	}
	log := cfg.Logger
	if log == nil {
		log = slog.Default()
	}
	return newHandler(NewService(apps, FileContent{Path: cfg.ContentPath}), cfg.AdminAuth, log), nil
}
