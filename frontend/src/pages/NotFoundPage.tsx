// src/pages/NotFoundPage.tsx

import { Link } from "../router";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <div class={styles.page}>
      <div class={`${styles.code} font-hand`}>404</div>
      <div class={`${styles.msg} font-hand`}>Страница не найдена</div>
      <p class={`${styles.hint} font-serif`}>
        Похоже, страница была вырвана из блокнота...
      </p>
      <Link href="/" class={`${styles.home} font-hand`}>
        На главную
      </Link>

      <div class={styles.tear} aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            class={styles.tearPiece}
            style={{ height: `${10 + Math.sin(i * 1.3) * 8}px` }}
          />
        ))}
      </div>
    </div>
  );
}
