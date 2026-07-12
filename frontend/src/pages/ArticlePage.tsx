import { type Component, createResource, Show } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { getArticle } from "../api";
import Badge from "../components/ui/Badge";
import s from "./ArticlePage.module.css";

// Markdown → HTML — без внешних зависимостей.
// Для production заменить на marked / remark.
function markdownToHtml(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="${s.body} data-lang="${lang}"><code>${escapeHtml(code.trim())}</code></pre>`
    )
    .replace(/`([^`]+)`/g, `<code>$1</code>`)
    .replace(/^## (.+)$/gm, `<h2>$1</h2>`)
    .replace(/^### (.+)$/gm, `<h3>$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^(?!<h[23]|<pre|<ul|<ol|<li|<block)(.+)$/gm, "<p>$1</p>")
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
  const params  = useParams<{ slug: string }>();
  const [article] = createResource(() => params.slug, getArticle);

  return (
    <div class={`${s.page} animate-fade-up`}>
      <Show when={article()} fallback={<div class={s.skeleton} />}>
        {(a) => (
          <article class={s.article}>
            {/* Breadcrumb */}
            <nav class={s.breadcrumb} aria-label="Навигация">
              <A href="/" class={s.crumb}>home</A>
              <span class={s.sep}>/</span>
              <A href={`/${a().section}`} class={s.crumb}>{a().section}</A>
              {a().project && (
                <>
                  <span class={s.sep}>/</span>
                  <A href={`/codex/${a().project}`} class={`${s.crumb} ${s.crumbAccent}`}>
                    {a().project}
                  </A>
                </>
              )}
              <span class={s.sep}>/</span>
              <span class={`${s.crumb} ${s.crumbAccent}`}>{a().slug}</span>
            </nav>

            {/* Header */}
            <header class={s.header}>
              <p class={s.chapter}>§ {a().section} · {a().kind}</p>
              <h1 class={s.title}>{a().title}</h1>

              <div class={s.meta}>
                {/* tabular-nums applied in CSS on .metaItem — reading time is a counter */}
                <span class={s.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7.25 4v4.75l3.5 2.1-.75 1.25L6 9.5V4h1.25z"/>
                  </svg>
                  {a().reading_time_minutes} мин чтения
                </span>
                <span class={s.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                  {formatDate(a().published_at)}
                </span>
                <Badge value={a().kind} />
              </div>
            </header>

            {/* Body — scoped via CSS Module .body for p, h2, h3, code, pre */}
            <div class={s.body} innerHTML={markdownToHtml(a().content)} />
          </article>
        )}
      </Show>
    </div>
  );
};

export default ArticlePage;