import { type Component, createResource, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { getProjects } from "../api";
import Badge from "../components/ui/Badge";
import Divider from "../components/ui/Divider";
import s from "./CodexPage.module.css";

function toRoman(n: number): string {
  const map: [number, string][] = [[1,"I"],[4,"IV"],[5,"V"],[9,"IX"],[10,"X"]];
  let result = "";
  for (const [val, sym] of map.reverse()) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

const CodexPage: Component = () => {
  const [projects] = createResource(getProjects);

  return (
    <div class={s.page}>
      <header class={s.header}>
        <p class={s.chapter}>§ codex</p>
        <h1 class={s.title}>Кодекс</h1>
        <p class={s.sub}>Проекты — от концепта до реализации.</p>
      </header>

      <Divider />

      <Show when={projects()} fallback={<div class={s.skeleton} />}>
        {(list) => (
          <div class={s.list}>
            <For each={list()}>
              {(project, i) => (
                <A
                  href={`/codex/${project.slug}`}
                  class={`${s.card} animate-fade-up`}
                  style={`animation-delay: ${i() * 60}ms`}
                >
                  <div class={s.cardHead}>
                    <div>
                      <p class={s.cardChapter}>§ chapter {toRoman(i() + 1)}</p>
                      <h2 class={s.cardTitle}>{project.title}</h2>
                    </div>
                    <Badge value={project.status} />
                  </div>
                  <p class={s.cardDesc}>{project.description}</p>
                  <span class={s.cardLink}>Открыть кодекс →</span>
                </A>
              )}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
};

export default CodexPage;