// src/router/index.jsx
// Лёгкий SPA-роутер на History API без внешних зависимостей.
//
// Использование:
//   <Router>
//     <Route path="/"          component={HomePage} />
//     <Route path="/projects"  component={ProjectsPage} />
//   </Router>
//
//   const { navigate, path } = useRouter()
//   <Link href="/projects">Проекты</Link>

import {
  createContext,
  createSignal,
  createMemo,
  useContext,
  onCleanup,
  onMount,
  Accessor,
  Component,
  ParentProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";

// ─── Types ───────────────────────────────────────────────────────────────────

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

  if (!ctx) {
    throw new Error("useRouter must be used inside <Router>");
  }

  return ctx;
}
// ─── Router ───────────────────────────────────────────────────────────────────

export function Router(props: ParentProps) {
  const [path, setPath] = createSignal(location.pathname);

  // Sync with browser history
  const onPop = () => setPath(location.pathname);
  onMount(() => window.addEventListener("popstate", onPop));
  onCleanup(() => window.removeEventListener("popstate", onPop));

  function navigate(
    to: string,
    { replace = false }: NavigateOptions = {},
  ): void {
    if (to === path()) return;
    replace
      ? history.replaceState(null, "", to)
      : history.pushState(null, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  }

  // Intercept all <a> clicks on the page (opt-in with data-spa)
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

/**
 * Routes выбирает первый <Route>, чей path совпадает с текущим.
 * Поддерживает точное совпадение и префикс (path="/module").
 */
export function Routes(props: { routes: RouteConfig[]; fallback?: Component }) {
  const { path } = useRouter();

  const matched = createMemo(() => {
    const current = path();

    // Exact match first, then prefix
    return (
      props.routes.find((r) => r.path === current) ??
      props.routes.find(
        (r) => r.path !== "/" && current.startsWith(r.path + "/"),
      )
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractParams(
  pattern: string,
  current: string,
): Record<string, string> {
  // Simple: strip the pattern prefix to get the "rest"
  if (!pattern.includes(":")) return {};
  const parts = pattern.split("/").slice(1);
  const cparts = current.split("/").slice(1);
  return Object.fromEntries(
    parts.flatMap((p, i) =>
      p.startsWith(":") ? [[p.slice(1), cparts[i] ?? ""]] : [],
    ),
  );
}

function NotFoundDefault() {
  return (
    <div style={{ padding: "2rem", "font-family": "Caveat, cursive" }}>404</div>
  );
}
