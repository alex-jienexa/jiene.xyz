// src/pages/ModulePage.tsx
// --------------------------
// Компонент `ModulePage` отображает страницу модуля, если он найден по текущему пути.
// Является некоторой "оболочкой", внутри которой будет находиться основное содержимое модуля.

import { moduleByPath } from "../modules/register";
import { useRouter } from "../router";
import NotFoundPage from "./NotFoundPage";
import { createMemo, Show } from "solid-js";

/**
 * Компонент для отображения страницы модуля.
 * Если модуль не найден, отображается страница 404.
 *
 * @returns Основной контент страницы модуля.
 */
export default function ModulePage() {
  const { path } = useRouter();
  const module = createMemo(() => moduleByPath(path()));

  return (
    <Show when={module()} fallback={<NotFoundPage />}>
      {(module) => (
        <div>
          <p>Рандомная модульная страница</p>
        </div>
      )}
    </Show>
  );
}
