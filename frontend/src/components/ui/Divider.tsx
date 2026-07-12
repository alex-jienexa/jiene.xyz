import { type Component, onMount, createSignal } from "solid-js";
import s from "./Divider.module.css";

interface DividerProps { label?: string; }

// Декоративный разделитель.
// Линии "вырастают" от центра при появлении в viewport (IntersectionObserver).
// Fallback-таймаут: если IO не сработает за 500ms (элемент уже в viewport
// при монтировании или threshold не достигнут) — анимация запускается всё равно.
const Divider: Component<DividerProps> = (props) => {
  const [visible, setVisible] = createSignal(false);
  let ref!: HTMLDivElement;

  onMount(() => {
    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
    };

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { trigger(); io.disconnect(); } },
      { threshold: 0.3 } // снижен с 0.5 — срабатывает раньше
    );
    io.observe(ref);

    // Fallback: если IO не сработал за 500ms — показать без анимации
    const fallback = setTimeout(() => { trigger(); io.disconnect(); }, 500);

    return () => { clearTimeout(fallback); io.disconnect(); };
  });

  return (
    <div class={s.divider} ref={ref}>
      <span class={`${s.line} ${visible() ? s.lineVisible : ""}`} />
      {props.label && <span class={s.label}>{props.label}</span>}
      {props.label && <span class={`${s.line} ${visible() ? s.lineVisible : ""}`} />}
    </div>
  );
};

export default Divider;