import { Show, type JSX } from "solid-js";
import { Navigate } from "@solidjs/router";
import { isAdmin } from "../auth/auth.store";

/**
 * AdminGuard оборачивает /admin. Намеренно ничего не объясняет
 * неавторизованному посетителю — просто возвращает на главную.
 * Подсказка про вход живёт в терминале (~ terminal -> login),
 * это соответствует tone of voice сайта: админка не рекламирует
 * себя случайным гостям.
 */
export default function AdminGuard(props: { children: JSX.Element }) {
  return (
    <Show when={isAdmin()} fallback={<Navigate href="/" />}>
      {props.children}
    </Show>
  );
}
