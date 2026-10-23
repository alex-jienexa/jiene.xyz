import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { gsap } from "../lib/gsap";
import { submitApplication } from "../lib/api";
import { isForbiddenName } from "../lib/gate";
import { tc } from "../paths";

const ERROR_TEXT = "Ваши данные не были отправлены ввиду неизвестной ошибки. Пожалуйста, попробуйте позднее";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Vacancy(props: { districts?: string[] }) {
  let root!: HTMLElement;
  const nav = useNavigate();
  const [name, setName] = createSignal(""), [district, setDistrict] = createSignal(""), [reason, setReason] = createSignal(""), [consent, setConsent] = createSignal(false);
  const [status, setStatus] = createSignal<"idle" | "loading" | "error">("idle");
  const [touched, setTouched] = createSignal(false);

  const errors = () => ({
    name: name().trim().length < 2 ? "Укажите имя и фамилию" : "",
    district: district() ? "" : "Выберите район",
    reason: reason().trim().length < 10 ? "Расскажите о себе (минимум 10 символов)" : "",
    consent: consent() ? "" : "Нужно согласие на обработку данных",
  });
  const valid = () => Object.values(errors()).every((e) => !e);
  const touch = () => status() === "error" && setStatus("idle");

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault(); setTouched(true);
    if (!valid() || status() === "loading") return;
    setStatus("loading");
    const secret = isForbiddenName(name());
    // Обычная заявка уходит на бэкенд (сохраняется в файл), но пользователь по ТЗ всегда видит ошибку.
    if (!secret) submitApplication({ name: name().trim(), district: district(), reason: reason().trim(), consent: consent() }).catch(() => {});
    await sleep(secret ? 1800 : 2600);
    if (secret) nav(tc("/secret")); else setStatus("error");
  };

  onMount(() => {
    const ctx = gsap.context(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const scrollTrigger = { trigger: root, start: "top 65%" };
      gsap.from(".vac__copy > *", { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out", scrollTrigger });
      gsap.from(".vac__form", { y: 50, opacity: 0, duration: 1.1, delay: 0.2, ease: "power3.out", scrollTrigger });
    }, root);
    onCleanup(() => ctx.revert());
  });

  const err = (k: keyof ReturnType<typeof errors>) => touched() && errors()[k];

  return (
    <section class="vac" ref={root}>
      <div class="vac__copy">
        <span class="vac__kicker">Исследовательская группа Tek-Core</span>
        <h2 class="cta__title">Станьте частью новой эры</h2>
        <p>Технология ещё совсем молодая: впереди сотни экспериментов, десятки улучшений протокола и первые в истории сети передачи живых пространств. Нам нужны те, кто готов исследовать, ошибаться и находить решения вместе с командой INFROCore.</p>
        <p>Расскажите о себе — мы свяжемся с теми, чья история нас зацепит.</p>
      </div>

      <form class="vac__form" onSubmit={onSubmit} novalidate>
        <div class="vac__bar" classList={{ on: status() === "loading" }} />
        <label class="field">
          <span>Имя и фамилия</span>
          <input type="text" autocomplete="name" value={name()} onInput={(e) => { setName(e.currentTarget.value); touch(); }} aria-invalid={!!err("name")} />
          <em>{err("name")}</em>
        </label>
        <label class="field">
          <span>Район проживания</span>
          <select value={district()} disabled={!props.districts} onChange={(e) => { setDistrict(e.currentTarget.value); touch(); }} aria-invalid={!!err("district")}>
            <option value="" disabled selected={!district()}>{props.districts ? "Выберите район" : "Загрузка…"}</option>
            <For each={props.districts}>{(d) => <option value={d} selected={district() === d}>{d}</option>}</For>
          </select>
          <em>{err("district")}</em>
        </label>
        <label class="field">
          <span>Причина отклика</span>
          <textarea rows="4" placeholder="О себе и о том, чем хотите заниматься" value={reason()} onInput={(e) => { setReason(e.currentTarget.value); touch(); }} aria-invalid={!!err("reason")} />
          <em>{err("reason")}</em>
        </label>
        <label class="check">
          <input type="checkbox" checked={consent()} onChange={(e) => { setConsent(e.currentTarget.checked); touch(); }} />
          <i /><span>Согласен на обработку персональных данных</span>
        </label>
        <em class="check__err">{err("consent")}</em>
        <button class="vac__submit" type="submit" disabled={status() === "loading"}>
          <Show when={status() === "loading"} fallback="Отправить заявку"><i class="spin" />Отправка…</Show>
        </button>
        <Show when={status() === "error"}><p class="vac__error" role="alert">{ERROR_TEXT}</p></Show>
      </form>
    </section>
  );
}
