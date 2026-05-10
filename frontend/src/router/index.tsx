// src/router/index.jsx
// Лёгкий SPA-роутер на History API без внешних зависимостей.
//
// Использование:
//   <Router>
//     <Route path="/"          component={HomePage} />
//     <Route path="/projects"  component={ProjectsPage} />
//     <Route path="/404"       component={NotFoundPage} />
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
  children,
  For,
  Show,
  JSX,
  Accessor,
  Component,
  ParentComponent,
  createComponent,
} from "solid-js";

// ─── Types ───────────────────────────────────────────────────────────────────

type NavigateOptions = {
  replace?: boolean;
};

type RouterContextType = {
  path: Accessor<string>;
  navigate: (to: string, options?: NavigateOptions) => void;
};

type RouteDefinition = {
  path: string;
  component: Component<any>;
};

type RoutesProps = {
  routes: RouteDefinition[];
};

type LinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  activeClass?: string;
  exact?: boolean;
};

type Params = Record<string, string | undefined>;

// ─── Context ──────────────────────────────────────────────────────────────────

const RouterContext = createContext<RouterContextType>();

export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext);

  if (!ctx) {
    throw new Error("useRouter must be used inside <Router>");
  }

  return ctx;
}
// ─── Router ───────────────────────────────────────────────────────────────────

export const Router: ParentComponent = (props) => {
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
  function handleAnchorClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    const a = target?.closest("a[data-spa]") as HTMLAnchorElement | null;
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute("href");
    if (href) navigate(href);
  }
  onMount(() => document.addEventListener("click", handleAnchorClick));
  onCleanup(() => document.removeEventListener("click", handleAnchorClick));

  const ctx: RouterContextType = { path, navigate };

  return (
    <RouterContext.Provider value={ctx}>
      {props.children}
    </RouterContext.Provider>
  );
};

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * Routes выбирает первый <Route>, чей path совпадает с текущим.
 * Поддерживает точное совпадение и префикс (path="/module").
 */
export const Routes: Component<RoutesProps> = (props) => {
  const { path } = useRouter();

  // Собираем route-записи из children
  const routes = createMemo<RouteDefinition[]>(() => {
    const ch = props.routes;
    return (Array.isArray(ch) ? ch : [ch]).filter(Boolean) as RouteDefinition[];
  });

  const matched = createMemo<RouteDefinition | null>(() => {
    const current = path();

    // Exact match first, then prefix
    return (
      routes().find((r) => r.path === current) ??
      routes().find(
        (r) => r.path !== "/" && current.startsWith(r.path + "/"),
      ) ??
      routes().find((r) => r.path === "/404") ??
      null
    );
  });

  return (
    <Show when={matched()} fallback={null}>
      {(route) => {
        const r = route();

        return createComponent(r.component, {
          params: extractParams(r.path, path()),
        });
      }}
    </Show>
  );
};

// ─── Link ─────────────────────────────────────────────────────────────────────

export const Link: Component<LinkProps> = (props) => {
  const { path } = useRouter();
  const isActive = (): boolean => {
    return props.exact
      ? path() === props.href
      : path() === props.href || path().startsWith(props.href + "/");
  };

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
      {...omit(props, ["href", "class", "activeClass", "exact"])}
    >
      {props.children}
    </a>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractParams(pattern: string, current: string): Params {
  // Simple: strip the pattern prefix to get the "rest"
  if (!pattern.includes(":")) return {};
  const parts = pattern.split("/").slice(1);
  const cparts = current.split("/").slice(1);
  return Object.fromEntries(
    parts
      .map((p, i) => (p.startsWith(":") ? [p.slice(1), cparts[i]] : null))
      .filter(Boolean) as [string, string | undefined][],
  );
}

function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k as K)),
  ) as Omit<T, K>;
}
