// src/layout/Spiral.tsx
// --------------------------
// Предоставляет компонент спиральной ленты `Spiral`.
// Смотрите документацию {@link Spiral} для получения информации.

import styles from "./Spiral.module.css";
import { JSX } from "solid-js";

/**
 * Свойства компонента спиральной ленты.
 */
interface SpiralProps {
  /**
   * Количество кольцевых элементов (по умолчанию 18).
   */
  count?: number;
  /**
   * Отображение спирального эффекта вертикально (если true, иначе горизонтальное) (по умолчанию false).
   */
  vertical?: boolean;
}

/**
 * Представляет спиральную ленту, которая состоит из кольцевых элементов.
 * Импортируется в компоненты, которые хотят использовать эту ленту. Может
 * быть использована для отображения спирального эффекта в приложении, как
 * декоративный элемент или загрузочный индикатор.
 *
 * @param {SpiralProps} props - Свойства компонента спиральной ленты.
 * @returns {JSX.Element} Элемент спиральной ленты.
 *
 * @example
 * Представить 20 вертикальных колец (используется в стандартном оформлении страницы)
 * ```tsx
 * <Spiral count={20} vertical={true} />
 * ```
 */
export function Spiral({
  count = 18,
  vertical = false,
}: SpiralProps): JSX.Element {
  return (
    <div
      class={`${styles.spiral} ${vertical ? styles.vertical : styles.horizontal}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div class={styles.ring} data-key={i} />
      ))}
    </div>
  );
}
