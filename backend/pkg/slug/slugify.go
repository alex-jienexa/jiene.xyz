// Package slug предоставляет метод `Generate()`, которая генерирует
// URL-slug из произвольного текста, в том числе кириллицы с помощью
// транслитерации.
package slug

import (
	"regexp"
	"strings"
)

// translitMap — полная таблица транслитерации кириллицы в латиницу.
var translitMap = map[rune]string{
	'а': "a", 'б': "b", 'в': "v", 'г': "g", 'д': "d",
	'е': "e", 'ё': "e", 'ж': "zh", 'з': "z", 'и': "i",
	'й': "y", 'к': "k", 'л': "l", 'м': "m", 'н': "n",
	'о': "o", 'п': "p", 'р': "r", 'с': "s", 'т': "t",
	'у': "u", 'ф': "f", 'х': "h", 'ц': "ts", 'ч': "ch",
	'ш': "sh", 'щ': "sch", 'ъ': "", 'ы': "y", 'ь': "",
	'э': "e", 'ю': "yu", 'я': "ya",
}

// Регулярные выражения для строковых проверок.

var nonAlphanumeric = regexp.MustCompile(`[^a-z0-9]+`)
var trimDashes = regexp.MustCompile(`^-+|-+$`)

// Generate превращает произвольный заголовок в URL-безопасный slug:
// "Первые заклинания" -> "pervye-zaklinaniya".
func Generate(input string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(input) {
		// Если получится взять символ из словаря, то добавляем латинский эквивалент.
		if lat, ok := translitMap[r]; ok {
			b.WriteString(lat)
			continue
		}
		// Иначе это латинский символ, добавляем его и так.
		b.WriteRune(r)
	}
	// Заменяем некоторые иные символы (пробелы, знаки) на дефисы.
	s := nonAlphanumeric.ReplaceAllString(b.String(), "-")
	// Удаляем последовательные дефисы.
	s = trimDashes.ReplaceAllString(s, "")
	return s
}
