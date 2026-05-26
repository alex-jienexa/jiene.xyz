// src/features/cover/Cover.jsx

import { PERSON } from "../../data/config";
import styles from "./Cover.module.css";

export function Cover() {
  return (
    <div class={styles.cover}>
      <div class={`${styles.stamp} font-fell`}>ЛИЧНОЕ</div>

      <header class={styles.header}>
        <div class={`${styles.label} font-hand`}>Блокнот №1</div>
        <h1 class={`${styles.name} font-hand`}>{PERSON.name}</h1>
        <div class={styles.underline} />
        <p class={`${styles.tagline} font-serif`}>{PERSON.tagline}</p>
      </header>

      {/* Мета-стикеры */}
      <div class={styles.stickers}>
        <div class={`${styles.sticker} font-hand`}>📍 {PERSON.location}</div>
        <div class={`${styles.sticker} font-hand`}>✉️ {PERSON.email}</div>
      </div>

      {/* Ссылки */}
      <div class={styles.links}>
        {PERSON.links.map((link) => (
          <a
            key={link.label}
            class={`${styles.link} font-hand`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkSvg icon={link.icon} />
            {link.label}
          </a>
        ))}
      </div>

      {/* Каракули */}
      <Doodles />
    </div>
  );
}

function Doodles() {
  return (
    <div class={styles.doodles} aria-hidden="true">
      <svg class={styles.star} viewBox="0 0 40 40" fill="none">
        <path
          d="M20 4L22.5 16L35 16L25 24L28 36L20 29L12 36L15 24L5 16L17.5 16Z"
          fill="none"
          stroke="var(--amber)"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
      <svg class={styles.loopSvg} viewBox="0 0 50 50" fill="none">
        <path
          d="M25 25Q28 22 30 25Q33 30 25 33Q17 33 15 25Q15 15 25 14Q37 14 38 25"
          stroke="var(--sage)"
          stroke-width="1.5"
          fill="none"
          stroke-linecap="round"
        />
      </svg>
    </div>
  );
}

function LinkSvg({ icon }) {
  const paths = {
    github:
      "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.37-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.04.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z",
    telegram:
      "M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.85 8.19-2.09 9.84c-.16.7-.56.87-1.14.54l-3.16-2.33-1.53 1.47c-.17.17-.31.31-.63.31l.22-3.23 5.8-5.24c.25-.22-.06-.35-.39-.12l-7.17 4.51-3.09-.97c-.67-.21-.68-.67.14-.99l12.06-4.65c.56-.2 1.05.14.88.86z",
    linkedin:
      "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.38V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.44a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.01H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z",
  };
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d={paths[icon] ?? ""} />
    </svg>
  );
}
