// src/router/index.tsx
// --------------------------
// SPA-роутер на History API + SolidJS signals.
// Позволяет динамически заменять компоненты в зависимости от текущего пути.

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
  ContextProviderComponent,
} from "solid-js";
import { JSX } from "solid-js/h/jsx-runtime";
import { Dynamic } from "solid-js/web";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Основной тип для настройки пути отображения. Представляет собой словарь со следующими полями:
 */
export interface RouteConfig {
  /**
   * Путь, по которому будет отображаться компонент.
   */
  path: string;
  /**
   * Компонент, который будет отображаться при совпадении пути.
   */
  component: Component<{ params?: Record<string, string> }>;
}

/**
 * Опции для навигации.
 */
export interface NavigateOptions {
  /**
   * Если `true`, то текущий путь будет заменен на новый, иначе будет добавлен в историю.
   */
  replace?: boolean;
}

/**
 * Интерфейс для значения контекста роутера. Получает текущий путь и функцию для навигации с помощью {@link Accessor} и {@link NavigateOptions}.
 */
export interface RouterContextValue {
  /**
   * Текущий путь приложения.
   */
  path: Accessor<string>;
  /**
   * Функция для навигации между страницами.
   */
  navigate: (to: string, opts?: NavigateOptions) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const RouterContext = createContext<RouterContextValue>();

/**
 * Функция для получения и использования значения контекста роутера.
 * Использует структуру {@link RouterContextValue} для доступа к текущему пути и функции навигации,
 * работающая по принципу синглтона и сигналов Solid.
 *
 * См. {@link RouterContextValue} для подробностей работы с контекстом.
 * @returns {RouterContextValue} Значение контекста роутера.
 */
export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter() must be used inside <Router>");
  return ctx;
}

// ─── Router ───────────────────────────────────────────────────────────────────

/**
 * Функция для рендеринга роутера и управления маршрутизацией.
 * Предоставляет контекст роутера для дочерних компонентов.
 *
 * @param {ParentProps} props - Свойства компонента, обычно содержат дочерние элементы для рендеринга.
 * @returns Компонент для предоставления значения контекста роутера.
 */
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

/**
 * Функция для рендеринга маршрутизированных маршрутов. Создаётся лишь единожды внутри
 * компонента `<Router>` и принимает массив маршрутов и опциональный компонент fallback.
 * См. {@link RouteConfig} и {@link Router} для подробностей.
 *
 * @param props - Свойства компонента, включая массив маршрутов типа {@link RouteConfig} и
 *  опциональный компонент fallback, который будет отображаться при несовпадении всех маршрутов в массиве.
 * @returns JSX-элемент для рендеринга.
 */
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

/**
 * Свойства компонента {@link Link}.
 */
interface LinkProps {
  /**
   * Путь для перехода.
   */
  href: string;
  /**
   * CSS-класс для ссылки.
   */
  class?: string;
  /**
   * CSS-класс для активной ссылки.
   */
  activeClass?: string;
  /**
   * Флаг точного совпадения пути.
   *
   * @todo я вижу, что там используется только для формирования ссылки в `<a>`, но надо перепроверить где ещё он используется
   */
  exact?: boolean;
  /**
   * Дочерний контент.
   */
  children?: any;
}

/**
 * Ссылка навигации, которая позволяет переходить между страницами приложения.
 *
 * @param props - Свойства компонента, включая `href` — путь для перехода, `class` — CSS-класс,
 *  `activeClass` — CSS-класс для активной ссылки, `exact` — флаг точного совпадения пути и `children` — дочерний контент.
 * @returns JSX-элемент для рендеринга ссылки.
 */
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

/**
 * Функция для извлечения параметров из текущего пути по шаблону.
 * @param pattern Шаблон пути.
 * @param current Текущий путь.
 * @returns Объект с параметрами.
 */
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

/**
 * Ссылка для отображения 404 ошибки.
 * @returns Элемент `<div>` с текстом "404".
 */
function NotFoundDefault() {
  return (
    <div style={{ padding: "2rem", "font-family": "Caveat, cursive" }}>404</div>
  );
}
