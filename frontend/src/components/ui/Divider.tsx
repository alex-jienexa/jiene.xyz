import { type Component, onMount, createSignal } from "solid-js";

interface DividerProps {
  label?: string;
}

// Декоративный разделитель
// Линии "вырастают" от центра при появлении в viewport (Intersection Observer).
const Divider: Component<DividerProps> = (props) => {
  const [visible, setVisible] = createSignal(false);
  let ref!: HTMLDivElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(ref);
  });

  return (
    <div class="divider" ref={ref}>
      <span class={`divider__line ${visible() ? "divider__line--visible" : ""}`} />
      {props.label && <span class="divider__label">{props.label}</span>}
      {props.label && <span class={`divider__line ${visible() ? "divider__line--visible" : ""}`} />}
    </div>
  );
};

export default Divider;
