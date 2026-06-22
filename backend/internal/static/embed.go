// Этот файл компилируется только тогда, когда сборка
// не имеет тега "dev"

//go:build !dev

package static

import (
	"embed"
	"io/fs"
	"net/http"

	"github.com/go-chi/chi/v5"
)

var embedFiles embed.FS

// Mount подключает файловую систему из директории files/*
// Это необходимо для подключения статических файлов из фронтенда
// как билд.
func Mount(r chi.Router) {
	staticFS, err := fs.Sub(embedFiles, "files")
	if err != nil {
		panic("failed to create static sub-filesystem: " + err.Error())
	}

	fileServer := http.FileServer(http.FS(staticFS))

	// Подключаем файловую систему для любого пути.
	r.Handle("/*", fileServer)
}
