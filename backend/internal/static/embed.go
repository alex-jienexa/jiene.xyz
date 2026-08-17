// Этот файл компилируется только тогда, когда сборка
// не имеет тега "dev"

//go:build !dev

package static

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

//go:embed all:files
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

	r.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if _, err := fs.Stat(staticFS, strings.TrimPrefix(req.URL.Path, "/")); err != nil {
			// файла нет — отдаём index.html, роутинг разберётся на клиенте
			req.URL.Path = "/"
		}
		fileServer.ServeHTTP(w, req)
	}))
}
