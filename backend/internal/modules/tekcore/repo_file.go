package tekcore

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"os"
	"sync"
	"time"
)

// record — формат строки в .jsonl (принадлежит адаптеру хранения).
type record struct {
	Name     string    `json:"name"`
	District string    `json:"district"`
	Reason   string    `json:"reason"`
	Consent  bool      `json:"consent"`
	At       time.Time `json:"at"`
}

// FileApplications — ApplicationRepository поверх .jsonl-файла (одна заявка на строку).
type FileApplications struct {
	mu   sync.Mutex
	path string
}

func NewFileApplications(path string) *FileApplications { return &FileApplications{path: path} }

func (r *FileApplications) Add(_ context.Context, a Application) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	f, err := os.OpenFile(r.path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600) // персональные данные: только владельцу
	if err != nil {
		return err
	}
	if err := json.NewEncoder(f).Encode(record(a)); err != nil {
		f.Close()
		return err
	}
	return f.Close()
}

func (r *FileApplications) List(_ context.Context) ([]Application, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	f, err := os.Open(r.path)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil // заявок ещё не было
	}
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var out []Application
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 0, 64<<10), 1<<20)
	for sc.Scan() {
		var rec record
		if json.Unmarshal(sc.Bytes(), &rec) == nil { // битая строка не должна ронять весь список
			out = append(out, Application(rec))
		}
	}
	return out, sc.Err()
}

// FileContent — ContentSource: читает файл при каждом запросе, поэтому правка файла
// меняет метрики без перезапуска сервера.
type FileContent struct{ Path string }

func (c FileContent) Load(context.Context) ([]byte, error) { return os.ReadFile(c.Path) }
