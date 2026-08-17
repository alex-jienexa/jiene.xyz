package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

// Config — параметры подключения. Передаются из main.go,
// который читает их из переменных окружения.
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Connect открывает пул соединений с PostgreSQL.
// Реальное соединение проверяется через waitForDB.
func Connect(cfg Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("opening database: %w", err)
	}

	if err := waitForDB(db); err != nil {
		return nil, err
	}

	// Настройки пула соединений — без них database/sql использует
	// значения по умолчанию, которые не оптимальны для веб-сервера.
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("pinging database: %w", err)
	}

	return db, nil
}

// waitForDB пытается подключиться к базе данных несколько раз с
// небольшой паузой.
func waitForDB(db *sql.DB) error {
	const maxAttempts = 10
	for i := range maxAttempts {
		if err := db.Ping(); err == nil {
			return nil
		}
		if i < maxAttempts-1 {
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}

	return fmt.Errorf("dataset is not ready after %d attempts", maxAttempts)
}
