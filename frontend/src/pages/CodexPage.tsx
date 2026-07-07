import { type Component, createResource, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { getProjects } from "../api";
import Badge from "../components/ui/Badge";
import Divider from "../components/ui/Divider";

const CodexPage: Component = () => {
  const [projects] = createResource(getProjects);

  return (
    <div class="page animate-fade-up">
      <header class="page-header">
        <p class="page-header__chapter">§ codex</p>
        <h1 class="page-header__title">Кодекс</h1>
        <p class="page-header__sub">Проекты — от концепта до реализации.</p>
      </header>

      <Divider />

      <Show when={projects()} fallback={<div class="skeleton skeleton--tall" />}>
        {(list) => (
          <div class="project-list">
            <For each={list()}>
              {(project, i) => (
                <A
                  href={`/codex/${project.slug}`}
                  class="project-card animate-fade-up"
                  style={`animation-delay: ${i() * 60}ms`}
                >
                  <div class="project-card__head">
                    <div>
                      <p class="project-card__chapter">§ chapter {toRoman(i() + 1)}</p>
                      <h2 class="project-card__title">{project.title}</h2>
                    </div>
                    <Badge value={project.status} />
                  </div>
                  <p class="project-card__desc">{project.description}</p>
                  <span class="project-card__link">Открыть кодекс →</span>
                </A>
              )}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
};

function toRoman(n: number): string {
  const map: [number, string][] = [[1,"I"],[4,"IV"],[5,"V"],[9,"IX"],[10,"X"]];
  let result = "";
  for (const [val, sym] of map.reverse()) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

export default CodexPage;
