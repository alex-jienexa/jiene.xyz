import { type Component, createResource, createSignal, For, Show } from "solid-js";
import { getArticles } from "../api";
import ArticleCard from "../components/ui/ArticleCard";
import Divider from "../components/ui/Divider";
import type { ArticleKind } from "../types";
import s from "./ChroniclesPage.module.css";

const KIND_FILTERS: { label: string; value: ArticleKind | "" }[] = [
  { label: "все",      value: "" },
  { label: "research", value: "research" },
  { label: "devlog",   value: "devlog" },
  { label: "essay",    value: "essay" },
  { label: "note",     value: "note" },
];

const ChroniclesPage: Component = () => {
  const [kind, setKind] = createSignal<ArticleKind | "">("");

  const [articles] = createResource(kind, (k) =>
    getArticles({ section: "chronicle", kind: k || undefined, limit: 20 })
  );

  return (
    <div class={s.page}>
      <header class={s.header}>
        <p class={s.chapter}>§ chronicle</p>
        <h1 class={s.title}>Хроника</h1>
        <p class={s.sub}>Записи, исследования и размышления в процессе.</p>
      </header>

      <Divider />

      <div class={s.filterRow} role="group" aria-label="Фильтр по типу">
        <For each={KIND_FILTERS}>
          {(f) => (
            <button
              class={`${s.filterBtn} ${kind() === f.value ? s.filterBtnActive : ""}`}
              onClick={() => setKind(f.value as ArticleKind | "")}
            >
              {f.label}
            </button>
          )}
        </For>
      </div>

      <Show
        when={articles()}
        fallback={
          <div class={s.skeletonGrid}>
            <div class={s.skeleton} />
            <div class={s.skeleton} />
            <div class={s.skeleton} />
          </div>
        }
      >
        {(res) => (
          <Show
            when={res().data.length > 0}
            fallback={<p class={s.empty}>Записей с таким фильтром пока нет.</p>}
          >
            <div class={s.grid}>
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