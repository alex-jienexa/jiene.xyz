import { type Component, createResource, For, Show } from "solid-js";
import { getProfile, getArticles } from "../api";
import Tag from "../components/ui/Tag";
import Divider from "../components/ui/Divider";
import ArticleCard from "../components/ui/ArticleCard";
import { openTerminal } from "../store";

const HomePage: Component = () => {
  const [profileData] = createResource(getProfile);
  const [recentArticles] = createResource(() =>
    getArticles({ section: "chronicle", limit: 3, page: 1 })
  );

  return (
    <div class="page page--home animate-fade-up">
      {/* ── Hero ── */}
      <section class="hero" aria-label="Введение">
        <p class="hero__chapter">§ prologue</p>

        <h1 class="hero__title">
          Builder of systems.<br />
          <span class="hero__title--accent">Student of chaos.</span>
        </h1>

        <p class="hero__sub">
          Выпускник, собирающий первые заклинания. Строю ИИ-агента для Pathfinder 2e
          и изучаю границы между правилами игры и машинным мышлением.
        </p>

        {/* Sigils — теги технологий */}
        <Show when={profileData()}>
          {(p) => (
            <div class="hero__sigils">
              <For each={p().tags.slice(0, 3)}>
                {(tag) => <Tag label={tag} variant="purple" />}
              </For>
              <For each={p().tags.slice(3)}>
                {(tag) => <Tag label={tag} variant="gray" />}
              </For>
            </div>
          )}
        </Show>

        {/* Статус с пульсирующей точкой */}
        <Show when={profileData()}>
          {(p) => (
            <div class="hero__status">
              <span class="status-dot" aria-hidden="true" />
              <span class="hero__status-text">{p().status}</span>
            </div>
          )}
        </Show>

        {/* Подсказка терминала */}
        <button class="hero__terminal-hint" onClick={openTerminal} aria-label="Открыть терминал">
          нажми <kbd>⌘K</kbd> или <kbd>~</kbd> чтобы открыть гримуар
        </button>
      </section>

      {/* ── Divider ── */}
      <Divider label="recent chronicles" />

      {/* ── Последние записи ── */}
      <section class="section" aria-label="Последние записи">
        <div class="section__head">
          <h2 class="section__title">Последние записи</h2>
          <a href="/chronicle" class="section__more">→ all entries</a>
        </div>

        <Show
          when={recentArticles()}
          fallback={<div class="skeleton-grid"><div class="skeleton" /><div class="skeleton" /><div class="skeleton" /></div>}
        >
          {(res) => (
            <div class="cards-grid">
              <For each={res().data}>
                {(article, i) => (
                  <ArticleCard
                    article={article}
                    featured={i() === 0}
                    animDelay={i() * 60}
                  />
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
