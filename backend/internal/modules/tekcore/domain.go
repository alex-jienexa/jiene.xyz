// Package tekcore — серверная часть лендинга Tek-Core как подключаемый модуль.
//
// Слои (зависимости направлены только внутрь):
//
//	domain.go, ports.go    сущности и интерфейсы, без внешних зависимостей
//	service.go             сценарии использования, знает только о портах
//	http.go, repo_file.go  адаптеры: доставка (HTTP) и хранение (файл)
//	module.go              сборка: единственное место, где адаптеры встречаются с сервисом
package tekcore

import (
	"errors"
	"strings"
	"time"
	"unicode/utf8"
)

// ErrValidation — заявка нарушает инварианты предметной области.
var ErrValidation = errors.New("tekcore: validation failed")

// Application — заявка на вакансию. Тегов сериализации нет намеренно: формат JSON
// принадлежит адаптерам (HTTP и хранилище), а не предметной области.
type Application struct {
	Name     string
	District string
	Reason   string
	Consent  bool
	At       time.Time
}

// NewApplication — единственный способ создать заявку: инварианты проверяются здесь,
// а не в хендлере. Длины считаются в символах, а не в байтах (кириллица — 2 байта).
func NewApplication(name, district, reason string, consent bool, at time.Time) (Application, error) {
	a := Application{
		Name:     strings.TrimSpace(name),
		District: strings.TrimSpace(district),
		Reason:   strings.TrimSpace(reason),
		Consent:  consent,
		At:       at,
	}
	nameLen, reasonLen := utf8.RuneCountInString(a.Name), utf8.RuneCountInString(a.Reason)
	if nameLen < 2 || nameLen > 120 || a.District == "" || reasonLen < 10 || reasonLen > 4000 || !a.Consent {
		return Application{}, ErrValidation
	}
	return a, nil
}
