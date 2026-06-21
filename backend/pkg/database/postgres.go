package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

// Config — параметры подключения. Передаются из main.go,
// который читает их из переменных окружения. database-пакет
// сам не знает о .env файлах — это ответственность main.go.
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Connect открывает пул соединений с PostgreSQL.
// Важно: sql.Open не устанавливает соединение немедленно —
// он только готовит пул. Реальное соединение проверяется через Ping.
func Connect(cfg Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("opening database: %w", err)
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
