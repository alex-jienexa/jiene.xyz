// Простые сигналы, вынесенные в модуль, и есть глобальный store.
// Reactive система Solid гарантирует, что все компоненты, читающие
// эти сигналы, обновятся автоматически при изменении.

import { createSignal } from "solid-js";
import type { Profile } from "../types";

// Терминал открыт/закрыт
const [terminalOpen, setTerminalOpen] = createSignal(false);

// Данные профиля — загружаются один раз при старте
const [profile, setProfile] = createSignal<Profile | null>(null);

export {
  terminalOpen, setTerminalOpen,
  profile, setProfile,
};

// Хелперы для открытия терминала
export function openTerminal() { setTerminalOpen(true); }
export function closeTerminal() { setTerminalOpen(false); }
export function toggleTerminal() { setTerminalOpen((v) => !v); }
