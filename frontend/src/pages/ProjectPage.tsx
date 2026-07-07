import { type Component, createResource, createSignal, For, Show } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { getProject, getProjectArticles } from "../api";
import Badge from "../components/ui/Badge";
import ArticleCard from "../components/ui/ArticleCard";
import Divider from "../components/ui/Divider";

type Tab = "overview" | "devlog";

const ProjectPage: Component = () => {
  const params = useParams<{ slug: string }>();
  const [tab, setTab] = createSignal<Tab>("overview");

  const [project] = createResource(() => params.slug, getProject);
  const [articles] = createResource(() => params.slug, getProjectArticles);

  const devlogs = () => articles()?.filter((a) => a.kind === "devlog") ?? [];
  const research = () => articles()?.filter((a) => a.kind !== "devlog") ?? [];

  return (
    <div class="page animate-fade-up">
      <Show when={project()} fallback={<div class="skeleton skeleton--tall" />}>
        {(p) => (
          <>
            {/* Шапка проекта */}
            <header class="project-header">
              <nav class="breadcrumb" aria-label="Навигация">
                <A href="/codex" class="breadcrumb__item">codex</A>
                <span class="breadcrumb__sep">/</span>
                <span class="breadcrumb__item breadcrumb__item--accent">{p().slug}</span>
              </nav>

              <p class="project-header__chapter">§ chapter I</p>
              <div class="project-header__row">
                <h1 class="project-header__title">{p().title}</h1>
                <Badge value={p().status} />
              </div>
              <p class="project-header__desc">{p().description}</p>
            </header>

            <Divider />

            {/* Вкладки */}
            <div class="tabs" role="tablist">
              <button
                class="tab"
                classList={{ "tab--active": tab() === "overview" }}
                onClick={() => setTab("overview")}
                role="tab"
                aria-selected={tab() === "overview"}
              >
                overview
              </button>
              <button
                class="tab"
                classList={{ "tab--active": tab() === "devlog" }}
                onClick={() => setTab("devlog")}
                role="tab"
                aria-selected={tab() === "devlog"}
              >
                devlog
              </button>
            </div>

            {/* Контент вкладок */}
            <Show when={tab() === "overview"}>
              <Show
                when={research().length > 0}
                fallback={
                  <div class="empty-state">
                    <p>Статьи ещё пишутся.</p>
                    <p class="empty-state__sub">Возвращайся, когда глава станет полнее.</p>
                  </div>
                }
              >
                <div class="cards-grid">
                  <For each={research()}>
                    {(a, i) => <ArticleCard article={a} animDelay={i() * 60} />}
                  </For>
                </div>
              </Show>
            </Show>

            <Show when={tab() === "devlog"}>
              <Show
                when={devlogs().length > 0}
                fallback={
                  <div class="empty-state">
                    <p>Дневник разработки пока пуст.</p>
                    <p class="empty-state__sub">Первая запись появится скоро.</p>
                  </div>
                }
              >
                <div class="cards-grid">
                  <For each={devlogs()}>
                    {(a, i) => <ArticleCard article={a} animDelay={i() * 60} />}
                  </For>
                </div>
              </Show>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
};

export default ProjectPage;
