package main

import (
	"log"
	"net/http"

	"alex-jienexa/jiene.xyz/backend/pkg/database"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	db, err := database.Connect(database.Config{
		Host:     "localhost",
		Port:     "5432",
		User:     "grimoire",
		Password: "",
		DBName:   "grimoire",
		SSLMode:  "disable",
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer db.Close() // Определяем закрытие подключения к базе данных когда заканчивается работа main

	// Это пример простейшего HTTP-сервера из документации Chi
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello World!"))
	})
	http.ListenAndServe(":3000", r)
}
