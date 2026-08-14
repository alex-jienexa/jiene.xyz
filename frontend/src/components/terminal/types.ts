import type { useNavigate } from "@solidjs/router";
import type { Profile } from "../../types";

// Типы вывода терминала
export type LineType = "output" | "dim" | "highlight" | "success" | "warning" | "error" | "prompt";

// Тип стандартной строки вывода терминала
export interface TermLine {
  type: LineType;
  text: string;
}

// Если команде нужен ещё один шаг ввода (например, login
// сначала спрашивает username, потом password), она возвращает CommandResult
// с этим полем вместо того, чтобы завершиться. Terminal.tsx запоминает
// `resume` и на следующий Enter вызывает именно его, а не executeCommand.
// 
// `resume` может быть асинхронным — понадобилось для login, который должен
// дождаться ответа /api/auth/login, прежде чем показать результат.
export interface AwaitInput {
  /** Если true — Terminal.tsx переключает input на type="password". */
  mask?: boolean;
  /** Функция, которая выполнится после ввода.
   * 
   * `value` содержит результат ввода.
   * `ctx` содердит информацию о пользователе и состояние навигации.
   */
  resume: (value: string, ctx: CommandContext) => CommandResult | Promise<CommandResult>;
}

// Результат выполнения команды.
export interface CommandResult {
  lines: TermLine[];
  navigate?: string;        // если команда должна перейти на страницу
  clear?: boolean;          // если команда очищает терминал
  close?: boolean;          // если команда закрывает терминал
  awaitInput?: AwaitInput;  // если командже нужен ввод
}

export interface CommandContext {
  profile: Profile | null;
  navigate: ReturnType<typeof useNavigate>;
}

/**
 * TerminalCommand — контракт самостоятельно регистрирующейся команды.
 * `match` — полная команда ("whoami", "clear") либо первое слово для
 * команд с аргументами ("roll" для "roll 1d20", "invoke" для "invoke pathfinder"
 * технически совпадает по первому слову — поэтому easter-eggs используют
 * полную фразу как match, см. easter-eggs.ts).
 */
export interface TerminalCommand {
  match: string;
  /** Скрыта из списка `help` (пасхалки). */
  hidden?: boolean;
  /** Строка в списке `help`. Обязательна, если hidden не true. */
  help?: string;
  run: (args: string, ctx: CommandContext) => CommandResult | Promise<CommandResult>;
}
