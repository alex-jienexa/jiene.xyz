import { type ParentComponent, onMount, onCleanup } from "solid-js";
import Navbar from "./Navbar";
import Terminal from "../terminal/Terminal";
import { toggleTerminal } from "../../store";
import s from "./RootLayout.module.css";

// RootLayout оборачивает все страницы: навигация + терминал + контент.
// Глобальные hotkeys регистрируются здесь, чтобы работали на любой странице.
const RootLayout: ParentComponent = (props) => {
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleTerminal();
      }
      if (e.key === "`" || e.key === "~") {
        const active = document.activeElement?.tagName;
        if (active !== "INPUT" && active !== "TEXTAREA") {
          e.preventDefault();
          toggleTerminal();
        }
      }
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  return (
    <>
      <Navbar />
      <main class={s.main}>
        <div class={s.content}>
          {props.children}
        </div>
      </main>
      <Terminal />
    </>
  );
};

export default RootLayout;