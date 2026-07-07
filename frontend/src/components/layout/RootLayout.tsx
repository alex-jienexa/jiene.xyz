import { type Component, type ParentComponent, onMount, onCleanup } from "solid-js";
import Navbar from "./Navbar";
import Terminal from "../terminal/Terminal";
import { toggleTerminal } from "../../store";

// RootLayout оборачивает все страницы: навигация + терминал + контент.
// Глобальные hotkeys регистрируются здесь, чтобы работали на любой странице.
const RootLayout: ParentComponent = (props) => {
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K — открыть терминал (паттерн command palette)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleTerminal();
      }
      // Тильда — как в играх (Quake, Skyrim)
      if (e.key === "`" || e.key === "~") {
        const active = document.activeElement?.tagName;
        // Не перехватываем если пользователь печатает в input/textarea
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
      <main class="layout__main">
        <div class="layout__content">
          {props.children}
        </div>
      </main>
      <Terminal />
    </>
  );
};

export default RootLayout;
