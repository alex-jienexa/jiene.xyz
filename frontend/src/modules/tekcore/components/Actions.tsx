import { createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { A } from "@solidjs/router";
import { gsap } from "../lib/gsap";
import type { Product } from "../lib/api";
import { DOCS } from "../data/docs";
import { tc } from "../paths";

const rub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;

// Заглушка-иллюстрация, пока в content.json у товара пустое поле image.
function ProductArt(p: { i: number }) {
  const h = 205 + p.i * 14, id = `pg${p.i}`;
  return (
    <svg viewBox="0 0 200 140" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color={`hsl(${h} 100% 70%)`} /><stop offset="1" stop-color={`hsl(${h + 20} 90% 40%)`} />
      </linearGradient></defs>
      <g transform="translate(100 70)" fill="none" stroke={`url(#${id})`} stroke-width="2">
        <rect x="-34" y="-34" width="68" height="68" rx="6" transform={`rotate(${15 + p.i * 20})`} />
        <rect x="-34" y="-34" width="68" height="68" rx="6" transform={`rotate(${60 + p.i * 20})`} opacity=".5" />
        <circle r={46 + p.i * 3} opacity=".35" /><circle r="8" fill={`url(#${id})`} stroke="none" />
      </g>
    </svg>
  );
}

export default function Actions(props: { products?: Product[] }) {
  let root!: HTMLElement, track!: HTMLDivElement;
  const [canPrev, setPrev] = createSignal(false), [canNext, setNext] = createSignal(false);
  const update = () => { setPrev(track.scrollLeft > 4); setNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4); };
  const by = (dir: number) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });

  createEffect(() => { props.products; queueMicrotask(() => track && update()); });

  onMount(() => {
    const ro = new ResizeObserver(update); ro.observe(track); update();
    const ctx = gsap.context(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const scrollTrigger = { trigger: root, start: "top 65%" };
      gsap.from(".cta__btn", { y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", scrollTrigger });
      gsap.from(".cta__shop", { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".cta__shop", start: "top 85%" } });
    }, root);
    onCleanup(() => { ro.disconnect(); ctx.revert(); });
  });

  return (
    <section class="cta" ref={root}>
      <div class="cta__info">
        <h2 class="cta__title">Начните работу с Tek-Core</h2>
        <nav class="cta__list">
          <For each={DOCS}>{(d, i) => (
            <A class="cta__btn" href={tc("/docs/" + d.slug)}><b>0{i() + 1}</b><span>{d.title}</span><i>→</i></A>
          )}</For>
        </nav>
      </div>

      <div class="cta__shop">
        <div class="cta__shophead">
          <h2 class="cta__title">Компоненты сети</h2>
          <div class="cta__arrows">
            <button aria-label="Назад" disabled={!canPrev()} onClick={() => by(-1)}>←</button>
            <button aria-label="Вперёд" disabled={!canNext()} onClick={() => by(1)}>→</button>
          </div>
        </div>
        <div class="cta__track" ref={track} onScroll={update}>
          <Show when={props.products} fallback={<For each={[0, 1, 2, 3]}>{() => <div class="card card--skeleton" />}</For>}>
            <For each={props.products}>{(p, i) => (
              <article class="card">
                <div class="card__img">{p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <ProductArt i={i()} />}</div>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div class="card__price">{rub(p.price)}</div>
              </article>
            )}</For>
          </Show>
        </div>
      </div>
    </section>
  );
}
