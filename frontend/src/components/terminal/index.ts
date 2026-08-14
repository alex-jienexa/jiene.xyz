import type { useNavigate } from "@solidjs/router";
import type { Profile } from "../../types";
import { getCommands } from "./registry";
import type { CommandResult, CommandContext } from "./types";

// Импорт каждого файла запускает саморегистрацию его команд
// (см. registry.ts). Чтобы добавить новую команду терминала — новый
// файл в этой папке + одна строка импорта здесь. Этот файл и
// Terminal.tsx больше не меняются.
import "./commands/core";
import "./commands/dice";
import "./commands/easter-eggs";

export type { TermLine, CommandResult, TerminalCommand, AwaitInput } from "./types";

/**
 * executeCommand — точка входа для "свежей" команды (не продолжения
 * многошагового ввода — это Terminal.tsx обрабатывает отдельно через
 * result.awaitInput.resume). Сигнатура намеренно не изменилась
 * по сравнению со старым commands.ts, чтобы Terminal.tsx не пришлось
 * переписывать целиком.
 */
export function executeCommand(
  raw: string,
  profile: Profile | null,
  navigate: ReturnType<typeof useNavigate>
): CommandResult | Promise<CommandResult> {
  const cmd = raw.trim().toLowerCase();
  const ctx: CommandContext = { profile, navigate };
  const commands = getCommands();

  // Сначала точное совпадение (whoami, clear, sudo без аргументов, ...),
  // затем совпадение по префиксу для команд с аргументами
  // (roll 1d20, invoke pathfinder, cat /etc/jiene/secrets).
  const exact = commands.find((c) => c.match === cmd);
  if (exact) return exact.run("", ctx);

  const prefixed = commands.find((c) => cmd.startsWith(c.match + " "));
  if (prefixed) return prefixed.run(cmd.slice(prefixed.match.length + 1).trim(), ctx);

  return {
    lines: [
      { type: "error", text: `Команда не найдена: ${cmd}` },
      { type: "dim", text: `  Введи 'help' чтобы увидеть список заклинаний.` },
    ],
  };
}
