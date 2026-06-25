package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"alex-jienexa/jiene.xyz/backend/internal/handler"
	custommiddleware "alex-jienexa/jiene.xyz/backend/internal/middleware"
	"alex-jienexa/jiene.xyz/backend/internal/repository"
	"alex-jienexa/jiene.xyz/backend/internal/service"
	"alex-jienexa/jiene.xyz/backend/internal/static"
	"alex-jienexa/jiene.xyz/backend/pkg/auth"
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

	jwtSecret := getEnv("JWT_SECRET", "")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}
	tokenService := auth.NewTokenService(jwtSecret, 24*time.Hour)

	adminPasswordHash := getEnv("ADMIN_PASSWORD_HASH", "")
	if adminPasswordHash == "" {
		log.Fatal("ADMIN_PASSWORD_HASH environment variable is required")
	}

	// --- Регистрация репозиториев ---
	profileRepo := repository.NewProfileRepository(db)

	// --- Регистрация сервисов ---
	profileService := service.NewProfileService(profileRepo)

	// --- Регистрация хендлеров ---
	profileHandler := handler.NewProfileHandler(profileService)
	authHandler := handler.NewAuthHandler(tokenService, jwtSecret)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	apiRouter := buildRouter(profileHandler, authHandler, tokenService)
	r.Mount("/api/", apiRouter)

	// --- Регистрируем статику ---
	// Делаем это последним, так как если сделать иначе, то сервер
	// будет ловить сначала пути из файловой системы (и вернёт 404),
	// и только потом будет смотреть пути из API (нет, не будет).
	static.Mount(r)

	addr := ":" + getEnv("BACKEND_PORT", "8080")

	// Далее идёт пример создания graceful shutdown из примеров от Chi.
	// ISSUE: При разработке (ввиду прослойки в виде Air) сервер не
	// будет выключаться через graceful shutdown. При прод-деплое,
	// скорее всего, проблемы не будет.

	// Создать объект сервера
	server := &http.Server{Addr: "0.0.0.0" + addr, Handler: r}
	// Создаём контекст который слушает сигналы прерывания
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Запускаем сервер на фоне
	go func() {
		log.Printf("jiene.xyz backend listening on %s", addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failed: %v", err)
		}
	}()

	// Слушаем сигнал прерывания
	<-ctx.Done()
	// Создаём контекст остановки сервера
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Запускаем graceful shutdown
	log.Print("starting graceful shutdown...")
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("failed to graceful shutdown: %v", err)
	}
}

// buildRouter собирает все маршруты бекенда приложения в одном месте.
// Тут описываются все пути API, а также объявляется контракт CORS.
// Если нужно добавить новый путь или новый хендлер, это делается
// здесь.
func buildRouter(
	profileHandler *handler.ProfileHandler,
	authHandler *handler.AuthHandler,
	tokenService *auth.TokenService,
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

	r.Post("/auth/login", authHandler.Login)

	r.Get("/whoami", profileHandler.Get)

	r.Group(func(r chi.Router) {
		r.Use(custommiddleware.RequireAuth(tokenService))

		r.Put("/whoami", profileHandler.Update)
	})

	return r
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
