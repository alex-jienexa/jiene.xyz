// src/pages/NotFoundPage.tsx
import { Link } from "../router";
import styles from "./NotFoundPage.module.css";

const TEAR_PATH = generateTearPath(55);

export default function NotFoundPage() {
  return (
    <div class={styles.root}>
      {/* ── СЛОЙ 1: Задний план — тёмный фон + текст ── */}
      <div class={styles.bg}>
        <div class={`${styles.code} font-hand`} aria-hidden="true">
          404
        </div>
        <div class={styles.textBlock}>
          <h1 class={`${styles.title} font-hand`}>Страница не найдена</h1>
          <p class={`${styles.hint} font-serif`}>
            Похоже, эта страница была вырвана из блокнота…
          </p>
          <Link href="/" class={`${styles.homeBtn} font-hand`} exact>
            ← Вернуться на главную
          </Link>
        </div>
      </div>

      {/* ── СЛОЙ 2: Передний план — блокнот + вырванная страница ── */}
      <div class={styles.foreground} aria-hidden="true">
        {/* Кожаная полоска с пружиной */}
        <div class={styles.leatherBar}>
          <div class={styles.leatherTexture} />
          <div class={styles.spiralRow}>
            {Array.from({ length: 22 }, (_, i) => (
              <div class={styles.ring} />
            ))}
          </div>
        </div>

        {/* Вырванная страница */}
        <div class={styles.tornPage}>
          {/* Линии на бумаге */}
          <div class={styles.tornLines}>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                class={styles.tornLine}
                style={{ width: `${50 + Math.sin(i * 2.3 + 0.5) * 30}%` }}
              />
            ))}
          </div>

          {/* Подпись на странице */}
          <span class={`${styles.tornLabel} font-hand`}>Страница удалена</span>
        </div>

        {/* SVG рваного края — ключевой визуальный элемент */}
        <svg
          class={styles.tearSvg}
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Тень под краем */}
          <path
            d={TEAR_PATH}
            fill="rgba(40,22,8,0.45)"
            transform="translate(0,6)"
          />
          {/* Сам бумажный край */}
          <path d={TEAR_PATH} fill="var(--paper)" />
        </svg>

        {/* Скомканный кусочек в правом нижнем углу вырванной зоны */}
        <div class={styles.crumple}>
          <div class={styles.crumpleInner} />
        </div>
      </div>
    </div>
  );
}

function generateTearPath(points: number): string {
  const w = 1000;
  const segs: string[] = ["M0,0"];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * w;
    const y =
      62 +
      Math.sin(i * 2.1 + 0.9) * 22 +
      Math.sin(i * 5.8 + 0.3) * 11 +
      Math.sin(i * 12.4 + 1.7) * 5;
    segs.push(`L${x.toFixed(1)},${Math.max(6, Math.min(94, y)).toFixed(1)}`);
  }
  segs.push("L1000,0 Z");
  return segs.join(" ");
}
