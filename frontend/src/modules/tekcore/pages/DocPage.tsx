import { For, onMount, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { DOCS } from "../data/docs";
import { tc } from "../paths";

export function NotFound() {
  return <main class="doc"><A class="doc__back" href={tc()}>← На главную</A><h1>Страница не найдена</h1></main>;
}

export default function DocPage() {
  const params = useParams();
  const doc = () => DOCS.find((d) => d.slug === params.slug);
  onMount(() => scrollTo(0, 0));
  return (
    <Show when={doc()} fallback={<NotFound />}>
      {(d) => (
        <main class="doc">
          <A class="doc__back" href={tc()}>← На главную</A>
          <h1>{d().title}</h1>
          <p class="doc__lead">{d().lead}</p>
          <For each={d().sections}>{(s) => <section><h2>{s.h}</h2><p>{s.p}</p></section>}</For>
        </main>
      )}
    </Show>
  );
}
