import { getSession } from "../auth/auth.store";
import type {
	Profile,
	ArticleListItem,
	Article,
	ArticlesResponse,
	Project,
	ProjectStatus,
	ArticleFilter,
	ArticleCreateInput,
	ArticleUpdateInput,
} from "../types";

const BASE = "/api"

// Расширил request() до поддержки метода/тела/авторизации вместо того,
// чтобы заводить второй похожий хелпер рядом — до сих пор весь API был
// read-only (только GET), поэтому исходная сигнатура этого не требовала.
// Токен берётся из auth.store автоматически: вызывающему коду (например,
// AdminPage) не нужно самому прокидывать его в каждый запрос.
interface RequestOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { method = "GET", body, auth = false } = options;

	const headers: HeadersInit = {};
	if (body !== undefined) headers["Content-Type"] = "application/json";
	if (auth) {
		const token = getSession()?.token;
		if (token) headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetch(`${BASE}${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const payload = await res.json().catch(() => null);
		throw new Error(payload?.error ?? `API error: ${res.status} | ${path}`);
	}
	if (res.status === 204) return undefined as T;
  	return res.json() as Promise<T>;
}

// === Auth ===

export interface LoginResponse {
  token: string;
  expires_at: string;
  user_id: number;
  username: string;
  role: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

// === Profile ===

export async function getProfile(): Promise<Profile> {
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

// === Articles: admin (требуют авторизации) ===

export async function createArticle(input: ArticleCreateInput): Promise<Article> {
  return request<Article>("/articles", { method: "POST", body: input, auth: true });
}

// Публичный getArticle(slug) теперь (после исправления) не отдаёт
// неопубликованные статьи вообще — для редактирования черновика
// нужен отдельный защищённый маршрут.
export async function getArticleForAdmin(slug: string): Promise<Article> {
  return request<Article>(`/admin/articles/${slug}`, { auth: true });
}

export async function updateArticle(slug: string, input: ArticleUpdateInput): Promise<Article> {
  return request<Article>(`/articles/${slug}`, { method: "PUT", body: input, auth: true });
}

export async function deleteArticle(slug: string): Promise<void> {
  return request<void>(`/articles/${slug}`, { method: "DELETE", auth: true });
}

export async function publishArticle(slug: string): Promise<void> {
  return request<void>(`/articles/${slug}/publish`, { method: "POST", auth: true });
}

// Публичный /articles на бэке жёстко фильтрует is_published=true
// (см. article_repository_pg.go) — это специально сделанное поведение
// сайта для гостей, трогать его нельзя. Админке нужен отдельный вход,
// видящий черновики: /admin/articles, защищён RequireAuth на бэке.
export async function getAllArticlesForAdmin(): Promise<ArticleListItem[]> {
  const res = await request<ArticlesResponse>("/admin/articles?limit=50", { auth: true });
  return res.data;
}

// === Projects ===

export async function getProjects(): Promise<Project[]> {
	return request<Project[]>("/projects");
}

export async function getProject(slug: string): Promise<Project> {
	return request<Project>(`/projects/${slug}`);
}

// === Projects: admin (требуют авторизации) ===

export interface ProjectCreateInput {
	slug?: string; // если пусто — бэкенд сгенерирует из title
	title: string;
	description: string;
	status: ProjectStatus;
}

// Все поля опциональны — undefined значит "не менять"
export interface ProjectUpdateInput {
	title?: string;
	description?: string;
	status?: ProjectStatus;
}

export async function createProject(input: ProjectCreateInput): Promise<Project> {
	return request<Project>("/projects", { method: "POST", body: input, auth: true });
}
 
export async function updateProject(slug: string, input: ProjectUpdateInput): Promise<Project> {
  	return request<Project>(`/projects/${slug}`, { method: "PUT", body: input, auth: true });
}
 
export async function deleteProject(slug: string): Promise<void> {
	return request<void>(`/projects/${slug}`, { method: "DELETE", auth: true });
}
 
export async function getProjectArticles(slug: string): Promise<ArticleListItem[]> {
	const res = await getArticles({ project: slug, limit: 50 });
	return res.data;
}
