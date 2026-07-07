import { type Component, createResource, For, Show } from "solid-js";
import { getArticles } from "../api";
import ArticleCard from "../components/ui/ArticleCard";
import Divider from "../components/ui/Divider";

export const LaboratoryPage: Component = () => {
  const [articles] = createResource(() => getArticles({ section: "lab", limit: 20 }));

  return (
    <div class="page animate-fade-up">
      <header class="page-header">
        <p class="page-header__chapter">§ laboratory</p>
        <h1 class="page-header__title">The Laboratory</h1>
        <p class="page-header__sub">Ideas in various states of decay and growth.</p>
      </header>

      <Divider />

      {/* Classified card — заглушка для будущих идей (design doc секция 10) */}
      <div class="lab-classified">
        <span class="lab-classified__label">?? classified</span>
        <p class="lab-classified__text">Следующая идея ещё формируется.</p>
      </div>

      <Show when={articles()} fallback={<div class="skeleton-grid"><div class="skeleton" /><div class="skeleton" /></div>}>
        {(res) => (
          <div class="cards-grid">
            <For each={res().data}>
              {(article, i) => <ArticleCard article={article} animDelay={i() * 60} />}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
};

export const AboutPage: Component = () => {
  return (
    <div class="page animate-fade-up">
      <article class="article">
        <p class="article__chapter">§ about</p>
        <h1 class="article__title">Alex Jienexa</h1>

        <div class="article__body">
          <p>
            Выпускник, который нашёл точку пересечения между машинным мышлением
            и механиками настольных ролевых игр. Строю системы, которые хотел бы
            использовать сам.
          </p>

          <h2>Текущий квест</h2>
          <p>
            <strong>Pathfinder AI</strong> — ИИ-агент, который анализирует боевую
            сцену в PF2e и принимает тактические решения на основе правил системы.
            Pathfinder 2e оказалась неожиданно удобным полигоном: строгая формальная
            математика, чёткие состояния, вероятностные исходы.
          </p>

          <h2>Стек</h2>
          <p>
            ML / AI, Golang, Solid.js, PostgreSQL. На пересечении backend-архитектуры
            и исследования AI-агентов.
          </p>

          <h2>Связь</h2>
          <p>
            Открыт к разговорам про AI, gamedev, EdTech и нестандартные проекты.
            Нажми <kbd>⌘K</kbd> и введи <code>contact</code>.
          </p>
        </div>
      </article>
    </div>
  );
};
