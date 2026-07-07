import { type Component, createResource, Show } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { getArticle } from "../api";
import Badge from "../components/ui/Badge";

// Простой Markdown → HTML конвертер без внешних зависимостей.
// Для production можно заменить на marked или remark.
// Поддерживает: h2, h3, code blocks, inline code, bold, параграфы.
function markdownToHtml(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="article-code-block"${lang ? ` data-lang="${lang}"` : ""}><code>${escapeHtml(code.trim())}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code class="article-code-inline">$1</code>')
    .replace(/^## (.+)$/gm, '<h2 class="article-h2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="article-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^(?!<h[23]|<pre|<ul|<ol|<li|<block)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, "");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    year: "numeric", month: "long", day: "numeric",
  });
}

const ArticlePage: Component = () => {
  const params = useParams<{ slug: string }>();
  const [article] = createResource(() => params.slug, getArticle);

  return (
    <div class="page animate-fade-up">
      <Show
        when={article()}
        fallback={<div class="skeleton skeleton--tall" />}
      >
        {(a) => (
          <article class="article">
            {/* Хлебные крошки */}
            <nav class="breadcrumb" aria-label="Навигация">
              <A href="/" class="breadcrumb__item">home</A>
              <span class="breadcrumb__sep">/</span>
              <A href={`/${a().section}`} class="breadcrumb__item">{a().section}</A>
              {a().project && (
                <>
                  <span class="breadcrumb__sep">/</span>
                  <A href={`/codex/${a().project}`} class="breadcrumb__item breadcrumb__item--accent">
                    {a().project}
                  </A>
                </>
              )}
              <span class="breadcrumb__sep">/</span>
              <span class="breadcrumb__item breadcrumb__item--accent">{a().slug}</span>
            </nav>

            {/* Шапка статьи */}
            <header class="article__header">
              <p class="article__chapter">§ {a().section} · {a().kind}</p>
              <h1 class="article__title">{a().title}</h1>

              <div class="article__meta">
                <span class="article__meta-item">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7.25 4v4.75l3.5 2.1-.75 1.25L6 9.5V4h1.25z"/>
                  </svg>
                  {a().reading_time_minutes} мин чтения
                </span>
                <span class="article__meta-item">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                  {formatDate(a().published_at)}
                </span>
                <Badge value={a().kind} />
              </div>
            </header>

            {/* Контент */}
            <div
              class="article__body"
              innerHTML={markdownToHtml(a().content)}
            />
          </article>
        )}
      </Show>
    </div>
  );
};

export default ArticlePage;
