// src/features/about/About.jsx

import { createSignal, ParentProps } from "solid-js";
import { PERSON } from "../../data/config";
import styles from "./About.module.css";

export function About() {
  const [factIdx, setFactIdx] = createSignal(0);

  const nextFact = () => setFactIdx((i) => (i + 1) % PERSON.facts.length);

  return (
    <div class={styles.about}>
      <SectionHeading>О себе</SectionHeading>

      {/* Bio card */}
      <div class={`${styles.bioCard} ruled`}>
        <div class={`${styles.bioTab} font-hand`}>Кратко</div>
        <p class={`${styles.bio} font-serif`}>{PERSON.bio}</p>
      </div>

      {/* Skills */}
      <div class={styles.section}>
        <h3 class={`${styles.sub} font-hand`}>Технологии</h3>
        <div class={styles.chips}>
          {PERSON.skills.map((s, i) => (
            <span
              key={s}
              class={`${styles.chip} font-hand`}
              style={{ "animation-delay": `${i * 0.04}s` }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div class={styles.section}>
        <h3 class={`${styles.sub} font-hand`}>Интересы</h3>
        <div class={styles.chips}>
          {PERSON.interests.map((item, i) => (
            <span
              key={item}
              class={`${styles.chip} ${styles.chipDashed} font-hand`}
              style={{ "animation-delay": `${i * 0.04}s` }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Random fact flip card */}
      <button class={styles.factCard} onClick={nextFact} type="button">
        <span class={styles.factEmoji}>💡</span>
        <span class={`${styles.factText} font-hand`}>
          {PERSON.facts[factIdx()]}
        </span>
        <span class={`${styles.factHint} font-hand`}>нажмите ещё</span>
      </button>
    </div>
  );
}

export function SectionHeading(props: ParentProps) {
  return (
    <div class={styles.heading}>
      <h2 class={`${styles.headingText} font-hand`}>{props.children}</h2>
      <div class={styles.headingLine} />
    </div>
  );
}
