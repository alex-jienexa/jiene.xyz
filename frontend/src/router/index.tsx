// src/router/index.tsx
// SPA-роутер на History API + SolidJS signals.
// Ключевое: Dynamic из solid-js/web для реактивной замены компонентов.

import {
  createContext,
  createSignal,
  createMemo,
  useContext,
  onCleanup,
  onMount,
  type Component,
  type ParentProps,
  type Accessor,
} from "solid-js";
import { Dynamic } from "solid-js/web";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouteConfig {
  path: string;
  component: Component<{ params?: Record<string, string> }>;
}

export interface NavigateOptions {
  replace?: boolean;
}

export interface RouterContextValue {
  path: Accessor<string>;
  navigate: (to: string, opts?: NavigateOptions) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const RouterContext = createContext<RouterContextValue>();

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter() must be used inside <Router>");
  return ctx;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function Router(props: ParentProps) {
  const [path, setPath] = createSignal(location.pathname);

  const onPop = () => setPath(location.pathname);
  onMount(() => window.addEventListener("popstate", onPop));
  onCleanup(() => window.removeEventListener("popstate", onPop));

  function navigate(to: string, { replace = false }: NavigateOptions = {}) {
    if (to === path()) return;
    replace
      ? history.replaceState(null, "", to)
      : history.pushState(null, "", to);
    setPath(to); // ← сигнал → весь граф реактивности обновляется
    window.scrollTo(0, 0);
  }

  function handleClick(e: MouseEvent) {
    const a = (e.target as Element).closest<HTMLAnchorElement>("a[data-spa]");
    if (!a) return;
    e.preventDefault();
    navigate(a.getAttribute("href") ?? "/");
  }
  onMount(() => document.addEventListener("click", handleClick));
  onCleanup(() => document.removeEventListener("click", handleClick));

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {props.children}
    </RouterContext.Provider>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────
// Dynamic — единственный правильный способ реактивно менять компонент в SolidJS.
// Без него компонент рендерится один раз и не обновляется при смене пути.

export function Routes(props: { routes: RouteConfig[]; fallback?: Component }) {
  const { path } = useRouter();

  const matched = createMemo(() => {
    const cur = path();
    return (
      props.routes.find((r) => r.path === cur) ??
      props.routes.find((r) => r.path !== "/" && cur.startsWith(r.path + "/"))
    );
  });

  // createMemo на компонент — Dynamic перерисует его реактивно
  const ActiveComponent = createMemo(
    () => matched()?.component ?? props.fallback ?? NotFoundDefault,
  );

  const params = createMemo(() =>
    matched() ? extractParams(matched()!.path, path()) : {},
  );

  return <Dynamic component={ActiveComponent()} params={params()} />;
}

// ─── Link ─────────────────────────────────────────────────────────────────────

interface LinkProps {
  href: string;
  class?: string;
  activeClass?: string;
  exact?: boolean;
  children?: any;
}

export function Link(props: LinkProps) {
  const { path } = useRouter();

  const isActive = createMemo(() =>
    props.exact
      ? path() === props.href
      : path() === props.href || path().startsWith(props.href + "/"),
  );

  return (
    <a
      href={props.href}
      data-spa=""
      class={
        [props.class, isActive() && props.activeClass]
          .filter(Boolean)
          .join(" ") || undefined
      }
      aria-current={isActive() ? "page" : undefined}
    >
      {props.children}
    </a>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function extractParams(
  pattern: string,
  current: string,
): Record<string, string> {
  if (!pattern.includes(":")) return {};
  const pp = pattern.split("/").slice(1);
  const cp = current.split("/").slice(1);
  return Object.fromEntries(
    pp.flatMap((p, i) =>
      p.startsWith(":") ? [[p.slice(1), cp[i] ?? ""]] : [],
    ),
  );
}

function NotFoundDefault() {
  return (
    <div style={{ padding: "2rem", "font-family": "Caveat, cursive" }}>404</div>
  );
}
