import type { TerminalCommand } from "./types";

const commands: TerminalCommand[] = [];

/**
 * `registerCommand` вызывается самими файлами команд при импорте
 * (`core.ts`, `dice.ts`, `easter-eggs.ts`, `auth.ts` — см. `index.ts`).
 * Чтобы добавить новую команду терминала:
 *   1. Создать `terminal/commands/<name>.ts`
 *   2. Вызвать `registerCommand({...})` вне функций (то есть в глобальном областе видимости)
 *   3. Добавить одну строку импорта в `terminal/commands/index.ts`
 * 
 * executeCommand() и Terminal.tsx при этом не меняются — `help`
 * тоже собирается из этого реестра автоматически (см. core.ts).
 */
export function registerCommand(cmd: TerminalCommand): void {
  if (commands.some((c) => c.match === cmd.match)) {
    console.warn(`[terminal] command "${cmd.match}" is already registered — skipping duplicate`);
    return;
  }
  commands.push(cmd);
}

export function getCommands(): TerminalCommand[] {
  return commands;
}
