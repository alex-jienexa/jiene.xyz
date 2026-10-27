import { createEffect, createSignal, For, onCleanup, onMount } from "solid-js";
import { gsap, ScrollTrigger } from "../lib/gsap";
type Scene = ReturnType<typeof import("./labScene").createLabScene>;

const STEPS = [
  { kicker: "Информационный режим", title: "Полная совместимость с инфосетью", text: "Tek-Core передаёт файлы и потоки данных так же, как инфосеть, — только в десятки раз быстрее. Ваши сервисы, протоколы и привычные инструменты продолжают работать без изменений." },
  { kicker: "Передача объектов", title: "Предмет целиком — через сеть", text: "Отправляйте предметы на любые расстояния так же свободно, как письма. Ядро сканирует объект, кодирует его и восстанавливает на принимающем узле — без курьеров, складов и ожидания. Наша гарантия — оригинал остаётся оригиналом на протяжении всей передачи." },
  { kicker: "Пространственные узлы", title: "Собственные цифровые пространства", text: "Создавайте, подключайте и обслуживайте собственную цифровую среду или подключайтесь к уже существующим программам. Ваши возможности в средах ограничиваются вашим разумом." },
];

export default function Formats() {
  let root!: HTMLElement, canvas!: HTMLCanvasElement;
  const [step, setStep] = createSignal(0);

  onMount(() => {
    let scene: Scene | undefined, gone = false;
    import("./labScene").then((m) => { if (gone) return; try { scene = m.createLabScene(canvas); scene.setStep(step()); } catch { /* нет WebGL */ } });
    createEffect(() => { const s = step(); scene?.setStep(s); });
    const st = ScrollTrigger.create({
      trigger: root, start: "top top", end: "+=300%", pin: true,
      onUpdate: (self) => setStep(Math.min(2, Math.floor(self.progress * 3))),
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    onCleanup(() => { gone = true; st.kill(); scene?.dispose(); });
  });

  return (
    <section class="formats" ref={root} data-theme={step() === 2 ? "light" : "dark"}>
      <div class="formats__media"><canvas ref={canvas} /></div>
      <div class="formats__copy">
        <div class="formats__counter">0{step() + 1}<span> / 03</span></div>
        <div class="formats__stage">
          <For each={STEPS}>{(s, i) => (
            <article class="formats__step" classList={{ "is-active": step() === i() }}>
              <h3>{s.kicker}</h3><h2>{s.title}</h2><p>{s.text}</p>
            </article>
          )}</For>
        </div>
        <div class="formats__dots"><For each={STEPS}>{(_, i) => <i classList={{ on: step() === i() }} />}</For></div>
      </div>
    </section>
  );
}
