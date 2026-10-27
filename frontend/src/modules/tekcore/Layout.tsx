import { onCleanup, onMount, type ParentProps } from "solid-js";
import "./tekcore.css"; // CSS подгружается вместе с этим lazy-чанком

const FONTS =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;800&family=Chakra+Petch:wght@500;700&family=Unbounded:wght@400;800&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:wght@500;800&family=Inter:wght@300;400;600&display=swap";

export default function Layout(props: ParentProps) {
  onMount(() => {
    // Динамически добавляем линк на шрифты
    const prevTitle = document.title;
    document.title = "Tek-Core — INFROCore";
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = FONTS; link.dataset.tc = "fonts";
    document.head.appendChild(link);
    // Layout размонтируется только при выходе из модуля — тогда и возвращаем хосту его заголовок и <head>
    onCleanup(() => { document.title = prevTitle; link.remove(); });
  });

  return (
    <div class="tc"> { /* Всё покрываем в класс tc, чтобы глобальный `main.css` не переписывал стили. */}
      <div class="progress" />
      {props.children}
    </div>
  );
}