// src/pages/HomePage.tsx
// --------------------------
// Основной контент главной страницы, предосталяет компонент `NotebookLayout` для отображения содержимого.

import { createSignal, Switch, Match } from "solid-js";
import { NotebookLayout } from "../layout/NotebookLayout";
import { About } from "../features/about/About";
import { Cover } from "../features/cover/Cover";

/**
 * Компонент `HomePage` отображает главную страницу приложения, используя компонент `NotebookLayout`.
 * @returns Компонент домашней страницы
 */
export default function HomePage() {
  const [tab, setTab] = createSignal("about");
  return (
    <NotebookLayout activePage={tab()} onNavigate={setTab}>
      <Switch>
        <Match when={tab() === "cover"}>
          <Cover />
        </Match>
        <Match when={tab() === "about"}>
          <About />
        </Match>
      </Switch>
    </NotebookLayout>
  );
}
