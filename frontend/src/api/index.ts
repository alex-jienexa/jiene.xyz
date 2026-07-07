import type {
  Profile,
  ArticleListItem,
  Article,
  ArticlesResponse,
  Project,
  ArticleFilter,
} from "../types";

const BASE = "/api"

async function request<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status} | ${path}`);
    return res.json() as Promise<T>;
}

// === Profile ===

async function getProfile(): Promise<Profile> {
    return request<Profile>("/whoami");
}

// === Aricles ===

export async function getArticles(filter: ArticleFilter = {}): Promise<ArticlesResponse> {
  const params = new URLSearchParams();
  if (filter.section) params.set("section", filter.section);
  if (filter.kind) params.set("kind", filter.kind);
  if (filter.tag) params.set("tag", filter.tag);
  if (filter.project) params.set("project", filter.project);
  if (filter.page) params.set("page", String(filter.page));
  if (filter.limit) params.set("limit", String(filter.limit));

  const qs = params.toString();
  return request<ArticlesResponse>(`/articles${qs ? `?${qs}` : ""}`);
}

export async function getArticle(slug: string): Promise<Article> {
  return request<Article>(`/articles/${slug}`);
}

// --- Projects ---

export async function getProjects(): Promise<Project[]> {
  return request<Project[]>("/projects");
}

export async function getProject(slug: string): Promise<Project> {
  return request<Project>(`/projects/${slug}`);
}

export async function getProjectArticles(slug: string): Promise<ArticleListItem[]> {
  const res = await request<ArticlesResponse>(`/projects/${slug}/articles`);
  return res.data;
}