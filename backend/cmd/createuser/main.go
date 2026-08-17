// cmd/createuser - CLI утилита для создания новых пользователей сайта.
// Такая адаптация готовит приложение для нескольких пользователей.
// На данный момент публичные эндпоинты не требуются, так как не
// планируется регистрация на сайте, но если появится необходимость
// в новых авторах статей - достаточно простого выполнения команды, а
// не рефакторинг приложения.
//
// Запуск:
//
// `go run ./cmd/createuser -username "User" -password "..."`
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"

	"alex-jienexa/jiene.xyz/backend/internal/entity"
	"alex-jienexa/jiene.xyz/backend/internal/repository"
	"alex-jienexa/jiene.xyz/backend/pkg/database"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Запросы через флаги (параметры) запуска
	username := flag.String("username", "", "имя пользователя для входа")
	password := flag.String("password", "", "пароль в открытом виде (будет захэширован)")
	role := flag.String("role", string(entity.RoleAdmin), "роль пользователя")
	flag.Parse()

	if *username == "" || *password == "" {
		fmt.Println(`[x] usage: go run ./cmd/createuser -username "User" -password "..."`)
		os.Exit(1)
	}

	// Подключаемся к БД, чтобы добавить нового пользователя
	db, err := database.Connect(database.Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "postgres"),
		DBName:   getEnv("DB_NAME", "database"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	})
	if err != nil {
		log.Fatalf("[x] failed to connect database: %v", err)
	}
	defer db.Close()

	userRepo := repository.NewUserRepository(db)

	// Получаем пользователя. Если он получен, значит пользователь существует.
	existing, err := userRepo.GetByUsername(context.Background(), *username)
	if err == nil {
		log.Printf("[!] user %q already exists (id=%d, role=%s) - skipping creation", existing.Username, existing.ID, existing.Role)
		return
	}
	if !errors.Is(err, entity.ErrNotFound) {
		log.Fatalf("[x] failed to check existing user: %v", err)
	}

	// Пароль хешируется
	hash, err := bcrypt.GenerateFromPassword([]byte(*password), 12)
	if err != nil {
		log.Fatalf("[x] failed to hash password: %v", err)
	}

	user, err := userRepo.Create(context.Background(), entity.UserCreateInput{
		Username:     *username,
		PasswordHash: string(hash),
		Role:         entity.UserRole(*role),
	})
	if err != nil {
		log.Fatalf("[x] failed to create user: %v", err)
	}

	log.Printf("[+] user created: id=%d username=%s role=%s\n", user.ID, user.Username, user.Role)

}

func getEnv(key, fallback string) string {
	// Копипаст из cmd/server для получения приватных полей из env
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
