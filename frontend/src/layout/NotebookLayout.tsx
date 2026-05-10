// src/layout/NotebookLayout.tsx
// --------------------------
// Предоставляет компонент отображения макета блокнота для страницы.
// Смотрите документацию {@link NotebookLayout} для получения информации.

import { JSX } from "solid-js";
import styles from "./NotebookLayout.module.css";
import { Spiral } from "./Spiral";

/**
 * Предоставляет схему макета блокнота для страницы.
 *
 * @param {JSX.Element} props.clildren - Дочерние элементы, которые будут отображаться внутри макета блокнота
 * @returns {JSX.Element} Элемент макета блокнота
 *
 * @todo Там не закончено отображение модулей, это нужно доделать!
 */
export function NotebookLayout(props: { children?: JSX.Element }): JSX.Element {
  return (
    <div class={styles.shell}>
      <div class={styles.cover}>
        <div class={styles.coverTexture} aria-hidden="true" />
        <Spiral count={24} vertical={false} />
      </div>

      <div class={styles.body}>
        <div class={styles.navPage}>
          <div class={styles.ribbon} />
          <div class={styles.navHeader}>
            <div class={`${styles.diaryDate} font-hand`}>{formatDate()}</div>
            <div class={`${styles.diaryTitle} font-hand`}>Мой Блокнотик</div>
            <div class={styles.divider} />
          </div>
          {/* Внутренние вкладки блокнота - местный аналог навигации */}

          {/* Вкладки модулей как отдельные страницы */}
        </div>

        <div class={styles.spine}>
          <Spiral count={14} vertical={true} />
        </div>

        <div class={styles.contentPage}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Neque porro
          quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
          adipisci velit.
          {props.children}
        </div>
      </div>
      <div class={styles.bottom}></div>
    </div>
  );
}

/**
 * Возвращает отформатированную дату в формате "день месяц год".
 *
 * @example
 * ```ts
 * formatDate() // -> "10 мая 2026"
 * ```
 *
 * @private
 */
function formatDate() {
  return new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
