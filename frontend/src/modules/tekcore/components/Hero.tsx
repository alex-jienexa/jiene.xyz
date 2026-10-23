import { onCleanup, onMount } from "solid-js";
import gsap from "gsap";
import type { SceneState } from "./heroScene";
import { scramble } from "../lib/scramble";

let introPlayed = false; // сбрасывается только полной перезагрузкой страницы
const SLOGAN = "Расстояние — это задача. Не ограничение.";

export default function Hero() {
  let canvas!: HTMLCanvasElement, slogan!: HTMLDivElement, title!: HTMLHeadingElement, meta!: HTMLDivElement, skip!: HTMLDivElement;
  const prevOverflow = document.body.style.overflow;

  onMount(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Страница открыта уже прокрученной (перезагрузка, якорь) — интро не играем и скролл не блокируем.
    const skipIntro = reduced || scrollY > 20 || introPlayed;
    introPlayed = true;
    const state: SceneState = skipIntro ? { pedestal: 1, light: 1, spin: 1.1 } : { pedestal: 0, light: 0, spin: 0.4 };
    let disposeScene = () => {}, gone = false;
    // Three.js грузится отдельным чанком; без WebGL страница остаётся рабочей (только без 3D).
    import("./heroScene").then((m) => { if (gone) return; try { disposeScene = m.createHeroScene(canvas, state); } catch { /* нет WebGL */ } });

    let tl: gsap.core.Timeline | undefined;
    let timer: number | undefined;
    const cleanups: Array<() => void> = [];

    if (skipIntro) {
      slogan.textContent = SLOGAN; title.textContent = "TEK-CORE";
      gsap.set(meta, { opacity: 1 }); gsap.set(slogan, { y: "-34vh", scale: 0.5 });
    } else {
      document.body.style.overflow = "hidden";
      tl = gsap.timeline({ delay: 0.9, onComplete: () => { document.body.style.overflow = prevOverflow; gsap.to(skip, { opacity: 0, duration: 0.2 }); } })
        .add(scramble(slogan, SLOGAN, 3.4, "", true))
        .to({}, { duration: 0.8 })
        .to(slogan, { y: "-34vh", scale: 0.5, duration: 1.6, ease: "power3.inOut" })
        .to(state, { pedestal: 1, duration: 2.2, ease: "power2.out" }, "<0.3")
        .to(state, { spin: 9, duration: 2.8, ease: "power3.in" }, "<0.8")
        .to(state, { light: 1, duration: 2.2, ease: "power2.inOut" }, "<1.2")
        .add(scramble(title, "TEK-CORE", 2.2, '"Orbitron", sans-serif'), "-=1.2")
        .to(state, { spin: 1.1, duration: 2.5, ease: "power2.out" }, "-=0.6")
        .to(meta, { opacity: 1, duration: 1.2 }, "-=1");

      // Первый клик показывает подсказку, второй (в течение 2.5 с) перематывает интро в конец.
      // progress(1, false): события не подавляются, поэтому onComplete у scramble ставит финальный текст.
      let armed = false;
      const onPointer = () => {
        if (!tl || tl.progress() >= 1) return;
        if (!armed) {
          armed = true; gsap.to(skip, { opacity: 1, duration: 0.3 });
          timer = window.setTimeout(() => { armed = false; gsap.to(skip, { opacity: 0, duration: 0.4 }); }, 2500);
        } else { clearTimeout(timer); tl.progress(1, false); }
      };
      // Браузер может восстановить скролл уже после монтирования — тоже завершаем интро.
      const onScroll = () => { if (tl && tl.progress() < 1 && scrollY > 20) tl.progress(1, false); };
      addEventListener("pointerdown", onPointer); addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => { removeEventListener("pointerdown", onPointer); removeEventListener("scroll", onScroll); });
    }

    onCleanup(() => {
      gone = true; clearTimeout(timer); tl?.kill(); cleanups.forEach((f) => f());
      document.body.style.overflow = prevOverflow; disposeScene();
    });
  });

  return (
    <section class="hero">
      <canvas ref={canvas} />
      <div class="hero__vignette" />
      <div class="hero__slogan" ref={slogan} aria-label={SLOGAN} />
      <h1 class="hero__title" ref={title} aria-label="TEK-CORE" />
      <div class="hero__skip" ref={skip}>Нажмите ещё раз, чтобы пропустить</div>
      <div class="hero__meta" ref={meta}>
        <span>INFROCore представляет</span>
        <span>Листайте вниз, чтобы узнать больше</span>
        <i class="hero__line" />
      </div>
    </section>
  );
}
