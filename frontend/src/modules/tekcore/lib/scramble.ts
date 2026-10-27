import gsap from "gsap";

const FONTS = ['"Orbitron"', '"Chakra Petch"', '"Unbounded"', '"JetBrains Mono"', '"Playfair Display"', "serif", "monospace"];
const GLYPHS = "01#$%&*+<>/\\АБВГДЖЗИКЛМНПРСТФХЦЧШЭЮЯABCDEFGHKMNRSTXZ";
const rnd = <T,>(a: ArrayLike<T>) => a[Math.floor(Math.random() * a.length)];
const range = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Символы мигают на случайных шрифтах, затем по очереди «схлопываются» в итоговый текст.
 * jitter (только слоган):
 *  - пока буква не встала на место, при каждом мигании меняются её позиция и размер;
 *  - после того как встала, буква и её позиция постоянны, но шрифт и кегль продолжают
 *    меняться до конца анимации, затем фиксируются в итоговом виде.
 */
export function scramble(el: HTMLElement, text: string, duration: number, baseFont = "", jitter = false) {
  el.textContent = "";
  const chars = [...text].map((ch) => {
    const s = document.createElement("span");
    s.textContent = ch;
    s.style.cssText = "display:inline-block;white-space:pre;text-align:center;visibility:hidden";
    el.appendChild(s);
    return { ch, s, at: 0.15 + Math.random() * 0.75, settled: false };
  });

  // Фиксируем ширину «слота» каждой буквы по её итоговому виду: смена шрифта и кегля
  // не двигает соседей, поэтому позиция уже вставшей буквы остаётся неизменной.
  if (jitter) {
    const widths = chars.map((c) => c.s.getBoundingClientRect().width); // сначала все замеры, потом записи — один reflow
    chars.forEach((c, i) => (c.s.style.width = `${widths[i]}px`));
  }

  const st = { p: 0 };
  return gsap.to(st, {
    p: 1, duration, ease: "none",
    onUpdate() {
      for (const c of chars) {
        if (c.ch === " ") { c.s.style.visibility = "visible"; continue; }
        if (st.p >= c.at) {
          if (!c.settled) {
            c.settled = true;
            c.s.textContent = c.ch; c.s.style.fontFamily = baseFont; c.s.style.transform = ""; c.s.style.visibility = "visible";
          } else if (jitter && Math.random() < 0.1) {
            // ~6 смен в секунду на букву: достаточно живо, но без стробоскопа
            c.s.style.fontFamily = rnd(FONTS);
            c.s.style.transform = `scale(${range(0.7, 1.5)})`;
          }
        } else if (Math.random() < 0.18 + st.p * 0.5) {
          c.s.textContent = rnd(GLYPHS); c.s.style.fontFamily = rnd(FONTS); c.s.style.visibility = "visible";
          if (jitter) c.s.style.transform = `translate(${range(-70, 70)}px,${range(-90, 90)}px) scale(${range(0.5, 2.4)})`;
        } else c.s.style.visibility = "hidden";
      }
    },
    onComplete() {
      for (const c of chars) {
        c.s.textContent = c.ch; c.s.style.fontFamily = baseFont; c.s.style.transform = "";
        c.s.style.width = ""; c.s.style.visibility = "visible"; // ширина снова естественная — не ломается при ресайзе
      }
    },
  });
}