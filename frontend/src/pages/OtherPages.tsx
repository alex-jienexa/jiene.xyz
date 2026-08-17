import { type Component, createResource, For, Show } from "solid-js";
import { getArticles } from "../api";
import ArticleCard from "../components/ui/ArticleCard";
import Divider from "../components/ui/Divider";
import s from "./OtherPages.module.css";

export const LaboratoryPage: Component = () => {
  const [articles] = createResource(() => getArticles({ section: "lab", limit: 20 }));

  return (
    <div class={`${s.page} animate-fade-up`}>
      <header class={s.pageHeader}>
        <p class={s.chapter}>§ laboratory</p>
        <h1 class={s.pageTitle}>The Laboratory</h1>
        <p class={s.pageSub}>Ideas in various states of decay and growth.</p>
      </header>

      <Divider />

      {/* Classified placeholder — design.md §10 */}
      <div class={s.classified} aria-label="Classified entry">
        <span class={s.classifiedLabel}>?? classified</span>
        <p class={s.classifiedHint}>Следующая идея ещё формируется.</p>
      </div>

      <Show
        when={articles()}
        fallback={
          <div class={s.labGrid}>
            <div class={s.labCard} style="opacity:0.4" />
            <div class={s.labCard} style="opacity:0.4" />
          </div>
        }
      >
        {(res) => (
          <Show 
            when={res().data.length > 0}
            fallback={<p class={s.empty}>Идей пока нет - лаборатория ждёт своих первых набросков.</p>}
          >
            <div class={s.labGrid}>
              <For each={res().data}>
                {(article, i) => <ArticleCard article={article} animDelay={i() * 60} />}
              </For>
            </div>
          </Show>
        )}
      </Show>
    </div>
  );
};

export const AboutPage: Component = () => (
  <div class={`${s.page} animate-fade-up`}>
    <header class={s.pageHeader}>
      <p class={s.chapter}>§ about</p>
      <h1 class={s.pageTitle}>Alex Jienexa</h1>
    </header>

    <Divider />

    <div class={s.aboutContent}>
      {/* Lead — left border lede style (design.md §7) */}
      <p class={s.lead}>
        Выпускник, который нашёл точку пересечения между машинным мышлением
        и механиками настольных ролевых игр. Строю системы, которые хотел бы
        использовать сам.
      </p>

      <p class={s.body}>
        <strong>Pathfinder AI</strong> — ИИ-агент, который анализирует боевую сцену
        в PF2e и принимает тактические решения на основе правил системы.
        Pathfinder 2e оказалась неожиданно удобным полигоном: строгая формальная
        математика, чёткие состояния, вероятностные исходы.
      </p>

      <p class={s.body}>
        ML / AI, Golang, Solid.js, PostgreSQL — на пересечении backend-архитектуры
        и исследования AI-агентов.
      </p>

      <Divider label="связь" />

      <div class={s.contact}>
        <div class={s.statusRow}>
          <span class={s.dot} aria-hidden="true" />
          <span class={s.statusText}>Открыт к разговору</span>
        </div>
        <div class={s.contactLinks}>
          <p class={s.body}>
            Нажми <kbd>⌘K</kbd> и введи <code>contact</code>.
          </p>
        </div>
      </div>
    </div>
  </div>
);