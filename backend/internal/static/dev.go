// Этот файл компилируется ТОЛЬКО при наличии тега "dev"

//go:build dev

package static

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

// Mount должен подключать объект файловой системы в роутер для
// статичных файлов, но во время разработки за это будет отвечать
// vite dev server на фронтенде.
// Поэтому этот метод возвращает ошибку.
func Mount(r chi.Router) {
	r.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "static files are handled by vite server", http.StatusNotFound)
	}))
}
