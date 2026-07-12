import { type Component, createResource, createSignal, For, Show } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { getProject, getProjectArticles } from "../api";
import Badge from "../components/ui/Badge";
import ArticleCard from "../components/ui/ArticleCard";
import Divider from "../components/ui/Divider";
import s from "./ProjectPage.module.css";

type Tab = "overview" | "devlog";

const ProjectPage: Component = () => {
  const params = useParams<{ slug: string }>();
  const [tab, setTab] = createSignal<Tab>("overview");

  const [project]  = createResource(() => params.slug, getProject);
  const [articles] = createResource(() => params.slug, getProjectArticles);

  const devlogs  = () => articles()?.filter((a) => a.kind === "devlog") ?? [];
  const research = () => articles()?.filter((a) => a.kind !== "devlog") ?? [];

  return (
    <div class={`${s.page} animate-fade-up`}>
      <Show when={project()} fallback={<div class={s.skeleton} />}>
        {(p) => (
          <>
            <header class={s.header}>
              <nav class={s.breadcrumb} aria-label="Навигация">
                <A href="/codex" class={s.crumb}>codex</A>
                <span class={s.sep}>/</span>
                <span class={`${s.crumb} ${s.crumbAccent}`}>{p().slug}</span>
              </nav>

              <p class={s.chapter}>§ chapter I</p>
              <div class={s.titleRow}>
                <h1 class={s.title}>{p().title}</h1>
                <Badge value={p().status} />
              </div>
              <p class={s.desc}>{p().description}</p>
            </header>

            <Divider />

            {/* Tabs — interruptible transitions on color+border-color (animations.md) */}
            <div class={s.tabs} role="tablist">
              {(["overview", "devlog"] as Tab[]).map((t) => (
                <button
                  class={`${s.tab} ${tab() === t ? s.tabActive : ""}`}
                  onClick={() => setTab(t)}
                  role="tab"
                  aria-selected={tab() === t}
                >
                  {t}
                </button>
              ))}
            </div>

            <Show when={tab() === "overview"}>
              <Show
                when={research().length > 0}
                fallback={
                  <div class={s.empty}>
                    <p>Статьи ещё пишутся.</p>
                    <p class={s.emptySub}>Возвращайся, когда глава станет полнее.</p>
                  </div>
                }
              >
                <div class={s.grid}>
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
                  <div class={s.empty}>
                    <p>Дневник разработки пока пуст.</p>
                    <p class={s.emptySub}>Первая запись появится скоро.</p>
                  </div>
                }
              >
                <div class={s.grid}>
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