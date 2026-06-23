package main

import (
	"log"
	"net/http"
	"os"

	"alex-jienexa/jiene.xyz/backend/internal/handler"
	"alex-jienexa/jiene.xyz/backend/internal/repository"
	"alex-jienexa/jiene.xyz/backend/internal/service"
	"alex-jienexa/jiene.xyz/backend/internal/static"
	"alex-jienexa/jiene.xyz/backend/pkg/database"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	db, err := database.Connect(database.Config{
		Host:     getEnv("DB_HOST", "db"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "postgres"),
		DBName:   getEnv("DB_NAME", "database"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer db.Close() // Определяем закрытие подключения к базе данных когда заканчивается работа main

	// --- Регистрация репозиториев ---
	profileRepo := repository.NewProfileRepository(db)

	// --- Регистрация сервисов ---
	profileService := service.NewProfileService(profileRepo)

	// --- Регистрация хендлеров ---
	profileHandler := handler.NewProfileHandler(profileService)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	apiRouter := buildRouter(profileHandler)
	r.Mount("/api/", apiRouter)

	// --- Регистрируем статику ---
	// Делаем это последним, так как если сделать иначе, то сервер
	// будет ловить сначала пути из файловой системы (и вернёт 404),
	// и только потом будет смотреть пути из API (нет, не будет).
	static.Mount(r)

	addr := ":" + getEnv("BACKEND_PORT", "8080")
	log.Printf("jiene.xyz backend listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

// buildRouter собирает все маршруты бекенда приложения в одном месте.
// Тут описываются все пути API, а также объявляется контракт CORS.
// Если нужно добавить новый путь или новый хендлер, это делается
// здесь.
func buildRouter(
	profileHandler *handler.ProfileHandler,
) http.Handler {
	r := chi.NewRouter()

	// Настройка CORS для взаимодействия между фронтендом и бекендом.
	// В разработке используется cross-origin с 3000 портом - портом
	// фронтенда, но когда идёт разворот на сервер и фронтенд
	// собирается как файлы в директории `dist/`, то можно сузить
	// список allowed origins до домена сайта.
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/whoami", profileHandler.Get)

	// TODO[jiene]: сделать защищённую группу через JWT-верификацию
	// для доступа к изменении информации о себе
	r.Post("/whoami", profileHandler.Update)

	return r
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
