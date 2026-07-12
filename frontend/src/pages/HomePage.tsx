import { type Component, createResource, For, Show } from "solid-js";
import { getProfile, getArticles } from "../api";
import Tag from "../components/ui/Tag";
import Divider from "../components/ui/Divider";
import ArticleCard from "../components/ui/ArticleCard";
import { openTerminal } from "../store";
import s from "./HomePage.module.css";

const HomePage: Component = () => {
  const [profileData] = createResource(getProfile);
  const [recentArticles] = createResource(() =>
    getArticles({ section: "chronicle", limit: 3, page: 1 })
  );

  return (
    <div class={s.page}>
      {/* ── Hero — semantic chunks staggered via CSS (animations.md) ── */}
      <section class={s.hero} aria-label="Введение">
        <p class={s.chapter}>§ prologue</p>

        <h1 class={s.title}>
          Builder of systems.<br />
          <span class={s.accent}>Student of chaos.</span>
        </h1>

        <p class={s.sub}>
          Выпускник, собирающий первые заклинания. Строю ИИ-агента для Pathfinder 2e
          и изучаю границы между правилами игры и машинным мышлением.
        </p>

        <Show when={profileData()}>
          {(p) => (
            <div class={s.sigils}>
              <For each={p().tags.slice(0, 3)}>
                {(tag) => <Tag label={tag} variant="purple" />}
              </For>
              <For each={p().tags.slice(3)}>
                {(tag) => <Tag label={tag} variant="gray" />}
              </For>
            </div>
          )}
        </Show>

        <Show when={profileData()}>
          {(p) => (
            <div class={s.status}>
              <span class={s.statusDot} aria-hidden="true" />
              <span class={s.statusText}>{p().status}</span>
            </div>
          )}
        </Show>

        <button class={s.termHint} onClick={openTerminal} aria-label="Открыть терминал">
          <kbd>⌘K</kbd>/<kbd>~</kbd> - открыть терминал
        </button>
      </section>

      <Divider label="recent chronicles" />

      <section class={s.section} aria-label="Последние записи">
        <div class={s.sectionHead}>
          <h2 class={s.sectionTitle}>Последние записи</h2>
          <a href="/chronicle" class={s.sectionMore}>→ all entries</a>
        </div>

        <Show
          when={recentArticles()}
          fallback={
            <div class={s.grid}>
              <div class="animate-fade-up" style="height:120px;background:var(--surface);border-radius:var(--r-lg)" />
              <div class="animate-fade-up" style="height:120px;background:var(--surface);border-radius:var(--r-lg);animation-delay:80ms" />
              <div class="animate-fade-up" style="height:120px;background:var(--surface);border-radius:var(--r-lg);animation-delay:160ms" />
            </div>
          }
        >
          {(res) => (
            <div class={s.grid}>
              <For each={res().data}>
                {(article, i) => (
                  <ArticleCard article={article} featured={i() === 0} animDelay={i() * 60} />
                )}
              </For>
            </div>
          )}
        </Show>
      </section>
    </div>
  );
};

export default HomePage;