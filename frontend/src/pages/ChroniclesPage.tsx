import { type Component, createResource, createSignal, For, Show } from "solid-js";
import { getArticles } from "../api";
import ArticleCard from "../components/ui/ArticleCard";
import Divider from "../components/ui/Divider";
import type { ArticleKind } from "../types";

const KIND_FILTERS: { label: string; value: ArticleKind | "" }[] = [
  { label: "все",       value: "" },
  { label: "research",  value: "research" },
  { label: "devlog",    value: "devlog" },
  { label: "essay",     value: "essay" },
  { label: "note",      value: "note" },
];

const ChroniclesPage: Component = () => {
  const [kind, setKind] = createSignal<ArticleKind | "">("");

  const [articles] = createResource(kind, (k) =>
    getArticles({ section: "chronicle", kind: k || undefined, limit: 20 })
  );

  return (
    <div class="page animate-fade-up">
      <header class="page-header">
        <p class="page-header__chapter">§ chronicle</p>
        <h1 class="page-header__title">Хроника</h1>
        <p class="page-header__sub">Записи, исследования и размышления в процессе.</p>
      </header>

      <Divider />

      {/* Фильтры по типу */}
      <div class="filter-row" role="group" aria-label="Фильтр по типу">
        <For each={KIND_FILTERS}>
          {(f) => (
            <button
              class="filter-btn"
              classList={{ "filter-btn--active": kind() === f.value }}
              onClick={() => setKind(f.value as ArticleKind | "")}
            >
              {f.label}
            </button>
          )}
        </For>
      </div>

      <Show
        when={articles()}
        fallback={<div class="skeleton-grid"><div class="skeleton" /><div class="skeleton" /><div class="skeleton" /></div>}
      >
        {(res) => (
          <Show
            when={res().data.length > 0}
            fallback={<p class="empty-state">Записей с таким фильтром пока нет.</p>}
          >
            <div class="cards-grid">
              <For each={res().data}>
                {(article, i) => (
                  <ArticleCard article={article} featured={i() === 0} animDelay={i() * 60} />
                )}
              </For>
            </div>
          </Show>
        )}
      </Show>
    </div>
  );
};

export default ChroniclesPage;
