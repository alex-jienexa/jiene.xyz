// Секретные слова: достаточно совпадения хотя бы одного слова из «Джой Бой» / «Мика Йокима».
const SECRET = new Set(["джой", "бой", "мика", "йокима"]);

export function isForbiddenName(name: string): boolean {
  return name.toLowerCase().replaceAll("ё", "е").split(/[^а-яa-z]+/).some((w) => SECRET.has(w));
}
