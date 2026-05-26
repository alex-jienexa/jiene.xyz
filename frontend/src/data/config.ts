// ========== Навигация ==========

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "cover", label: "Обложка", icon: "📓" },
  { id: "about", label: "О себе", icon: "👤" },
];

// ========== О себе ==========

export interface PersonLink {
  label: string;
  href: string;
  icon: "github" | "telegram";
}

export interface Person {
  name: string;
  nickname: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  links: PersonLink[];
  skills: string[];
  interests: string[];
  facts: string[];
}

export const PERSON: Person = {
  name: "Alex Jienexa",
  nickname: "@jiene",
  tagline: "Разработчик · Мечтатель · Создатель вещей",
  bio: `Привет! Я разработчик, который любит создавать красивые и продуманные вещи. Этот блокнот — небольшое окошко в мой мир: проекты, мысли и всё интересное.`,
  location: "Симферополь",
  email: "alexjienexa+xyz@gmail.com",
  links: [
    {
      label: "GitHub",
      href: "https://github.com/alex-jienexa",
      icon: "github",
    },
    {
      label: "Telegram",
      href: "https://t.me/jiellluk_jiene",
      icon: "telegram",
    },
  ],
  skills: [
    "Machine Learning",
    "Go",
    "TypeScript",
    "Solid.js",
    "PostgreSQL",
    "Docker",
  ],
  interests: ["pathfinder 2e", "программирование", "чай ☕", "фотография"],
  facts: [
    "Начинаю TODO-лист с «написать TODO-лист»",
    "Пью слишком много чая. Это часть процесса.",
  ],
};
