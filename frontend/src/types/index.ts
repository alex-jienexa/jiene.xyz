// Типы возвращаемых ответов от Backend. При изменении схемы ответа
// TypeScript скажет, где именно надо изменять структуру.

export interface Profile {
  name: string;
  alias: string;
  role: string;
  status: string;
  tags: string[];
  links: Record<string, string>;
}

export type ArticleSection = "chronicle" | "codex" | "lab";
export type ArticleKind = "article" | "devlog" | "research" | "note" | "essay";
export type ProjectStatus = "in_progress" | "concept" | "completed" | "abandoned";

export interface ArticleListItem {
  slug: string;
  title: string;
  section: ArticleSection;
  kind: ArticleKind;
  tags: string[];
  project?: string;       // slug проекта
  is_published: boolean;
  published_at?: string;  // ISO 8601
  reading_time_minutes: number;
}

export interface Article extends ArticleListItem {
  content: string;       // Markdown
  created_at: string;
  updated_at: string;
}

export interface ArticlesResponse {
  data: ArticleListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  status: ProjectStatus;
  created_at: string;
}

export interface ArticleFilter {
  section?: ArticleSection;
  kind?: ArticleKind;
  tag?: string;
  project?: string;
  page?: number;
  limit?: number;
}

export interface ArticleCreateInput {
  slug?: string; // если пусто — бэкенд сгенерирует из title
  project_id?: number | null;
  title: string;
  section: ArticleSection;
  kind: ArticleKind;
  content: string;
  tags: string[];
}

// Все поля опциональны — пришедшее undefined значит "не менять".
export interface ArticleUpdateInput {
  title?: string;
  section?: ArticleSection;
  kind?: ArticleKind;
  content?: string;
  is_published?: boolean;
  tags?: string[];
}