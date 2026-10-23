import { onCleanup, onMount } from "solid-js";
import { gsap } from "../lib/gsap";

export default function About() {
  let root!: HTMLElement;
  onMount(() => {
    const ctx = gsap.context(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const scrollTrigger = { trigger: root, start: "top 60%" };
      gsap.from(".about__rule", { scaleX: 0, duration: 1.2, ease: "power3.inOut", scrollTrigger });
      gsap.from(".about__title", { y: 60, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger });
      gsap.from(".about__text", { y: 40, opacity: 0, duration: 1.2, delay: 0.25, ease: "power3.out", scrollTrigger });
    }, root);
    onCleanup(() => ctx.revert());
  });
  return (
    <section class="about" ref={root}>
      <i class="about__rule" />
      <h2 class="about__title">Новая эра передачи информации</h2>
      <p class="about__text">
        Tek-Core — технология корпорации INFROCore, с которой по сети передаётся не только информация, но и объекты целиком,
        а новые информационные пространства создаются по требованию. Она полностью поддерживает протокол инфосети — но работает на порядок быстрее.
      </p>
    </section>
  );
}
