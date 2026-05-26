// src/layout/NotebookLayout.tsx
// --------------------------
// Предоставляет компонент отображения макета блокнота для страницы.
// Смотрите документацию {@link NotebookLayout} для получения информации.

import { JSX, ParentProps } from "solid-js";
import styles from "./NotebookLayout.module.css";
import { Spiral } from "./Spiral";
import { NAV_ITEMS } from "../data/config";

/**
 * Компонент для описания свойств компонента {@link NotebookLayout}.
 * Наследует свойства от {@link ParentProps}, содержащие дочерние элементы `children`.
 */
interface NotebookLayoutProps extends ParentProps {
  /**
   * Кодовый ID текущей подстраницы, выбранной в {@link NotebookLayout} и
   * отображаемый при иинициализации компонента.
   */
  activePage: string;
  /**
   * Функция обратного вызова, вызываемая при навигации к другой подстранице.
   * @param id Кодовый ID новой подстраницы
   * @returns
   */
  onNavigate: (id: string) => void;
}

/**
 * Предоставляет схему макета блокнота для страницы.
 *
 * @param {NotebookLayoutProps} props - Свойства компонента, включая дочерние элементы `children`, см. {@link NotebookLayoutProps} для описания свойств
 * @returns {JSX.Element} Элемент макета блокнота
 *
 * @todo Там не закончено отображение модулей, это нужно доделать!
 */
export function NotebookLayout(props: NotebookLayoutProps): JSX.Element {
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
          <nav class={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                class={`${styles.navBtn} font-hand ${props.activePage === item.id ? styles.navBtnActive : ""}`}
                onClick={() => props.onNavigate(item.id)}
              >
                <span class={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {props.activePage === item.id && <span class={styles.navDot} />}
              </button>
            ))}
          </nav>

          {/* Вкладки модулей */}
        </div>

        <div class={styles.spine}>
          <Spiral count={14} vertical={true} />
        </div>

        <div class={`${styles.contentPage} ruled-only`}>{props.children}</div>
      </div>
      <div class={styles.bottom}></div>
    </div>
  );
}

/**
 * Возвращает сегодняшнюю дату в формате "день месяц год".
 *
 * @example
 * ```ts
 * formatDate() // -> "10 мая 2026"
 * ```
 */
function formatDate() {
  return new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
