import { type Component, createSignal, onMount, onCleanup } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { openTerminal } from "../../store";
import s from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/chronicle",  label: "chronicle"  },
  { href: "/codex",      label: "codex"      },
  { href: "/laboratory", label: "laboratory" },
  { href: "/about",      label: "about"      },
] as const;

const Navbar: Component = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = createSignal(false);

  onMount(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", handler));
  });

  return (
    <header class={`${s.nav} ${scrolled() ? s.scrolled : ""}`}>
      <A href="/" class={s.brand} aria-label="jiene — home">
        <span class={s.name}>jiene</span>
        <span class={s.rune}>· · · grimoire · · ·</span>
      </A>

      <nav aria-label="Основная навигация">
        <ul class={s.links}>
          {NAV_LINKS.map((link) => (
            <li>
              <A
                href={link.href}
                class={`${s.link} ${location.pathname.startsWith(link.href) ? s.linkActive : ""}`}
              >
                {link.label}
              </A>
            </li>
          ))}
        </ul>
      </nav>

      <button
        class={s.terminal}
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