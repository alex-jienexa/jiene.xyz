import { type Component, createSignal, onMount, onCleanup } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { openTerminal } from "../../store";

const NAV_LINKS = [
  { href: "/chronicle", label: "chronicle" },
  { href: "/codex",     label: "codex" },
  { href: "/laboratory",label: "laboratory" },
  { href: "/about",     label: "about" },
] as const;

const Navbar: Component = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = createSignal(false);

  // Backdrop-blur появляется при скролле
  onMount(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", handler));
  });

  return (
    <header class={`navbar ${scrolled() ? "navbar--scrolled" : ""}`}>
      <A href="/" class="navbar__brand">
        <span class="navbar__name">jiene</span>
        <span class="navbar__rune">· · · grimoire · · ·</span>
      </A>

      <nav class="navbar__links" aria-label="Основная навигация">
        {NAV_LINKS.map((link) => (
          <A
            href={link.href}
            class="navbar__link"
            classList={{ "navbar__link--active": location.pathname.startsWith(link.href) }}
          >
            {link.label}
          </A>
        ))}
      </nav>

      {/* Кнопка открытия терминала */}
      <button
        class="navbar__terminal"
        onClick={openTerminal}
        aria-label="Открыть терминал (⌘K)"
        title="⌘K"
      >
        ~ terminal
      </button>
    </header>
  );
};

export default Navbar;
