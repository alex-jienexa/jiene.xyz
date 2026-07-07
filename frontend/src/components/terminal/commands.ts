import { useNavigate } from "@solidjs/router";
import { closeTerminal } from "../../store";
import type { Profile } from "../../types";

// Типы вывода терминала — соответствуют цветам из design document секция 8
export type LineType = "output" | "dim" | "highlight" | "success" | "warning" | "error" | "prompt";

export interface TermLine {
  type: LineType;
  text: string;
}

// Результат выполнения команды
export interface CommandResult {
  lines: TermLine[];
  navigate?: string; // если команда должна перейти на страницу
  clear?: boolean;   // если команда очищает терминал
  close?: boolean;   // если команда закрывает терминал
}

// Дайс в нотации PF2e: "1d20", "2d6+3", "1d8-1"
function rollDice(notation: string): CommandResult {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) {
    return { lines: [{ type: "error", text: `⚠ Неверная нотация. Пример: roll 1d20 или roll 2d6+3` }] };
  }

  const count  = parseInt(match[1]);
  const sides  = parseInt(match[2]);
  const mod    = match[3] ? parseInt(match[3]) : 0;

  if (count > 100 || sides > 1000) {
    return { lines: [{ type: "warning", text: "⚠ Слишком много кубиков, маг устал метаться кубами." }] };
  }

  const rolls = Array.from({ length: count }, () => Math.ceil(Math.random() * sides));
  const sum   = rolls.reduce((a, b) => a + b, 0) + mod;
  const total = Math.max(1, sum);

  const isCrit    = sides === 20 && rolls[0] === 20;
  const isCritFail= sides === 20 && rolls[0] === 1;

  const rollStr = rolls.length > 1 ? `[${rolls.join(", ")}]` : String(rolls[0]);
  const modStr  = mod !== 0 ? ` ${mod > 0 ? "+" : ""}${mod}` : "";

  const lines: TermLine[] = [
    { type: "dim",  text: `Бросок: ${notation} → ${rollStr}${modStr}` },
  ];

  if (isCrit) {
    lines.push({ type: "success", text: `✦ КРИТИЧЕСКИЙ УСПЕХ! Итого: ${total}` });
  } else if (isCritFail) {
    lines.push({ type: "warning", text: `⚠ КРИТИЧЕСКИЙ ПРОВАЛ. Итого: ${total}` });
  } else {
    lines.push({ type: "success", text: `✦ Итого: ${total}` });
  }

  return { lines };
}

// Команды скрытые в help (easter eggs) — design document секция 8
const EASTER_EGGS: Record<string, (profile: Profile | null) => CommandResult> = {
  "invoke pathfinder": () => ({
    lines: [
      { type: "warning", text: "⚠ Заклинание ещё даже не начиналось." },
      { type: "dim",     text: "  Глава I ещё пишется. Возвращайся позже." },
      { type: "dim",     text: "  Или напиши: contact" },
    ],
  }),

  "cat /etc/jiene/secrets": () => ({
    lines: [
      { type: "dim",       text: "Reading /etc/jiene/secrets..." },
      { type: "highlight", text: "  alias: jiene" },
      { type: "highlight", text: "  true_class: Technomancer" },
      { type: "highlight", text: "  current_quest: Pathfinder AI — Phase 1" },
      { type: "dim",       text: "  hidden_stat: charisma +0" },
      { type: "success",   text: "✦ Ты нашёл это. Любопытство — хорошее заклинание." },
    ],
  }),

  "ls -la": () => ({
    lines: [
      { type: "dim",       text: "drwxr-xr-x  jiene staff  grimoire/" },
      { type: "highlight", text: "-rw-r--r--  §this_site          [somewhen]" },
      { type: "dim",       text: "-rw-r--r--  §prologue           [???]" },
      { type: "dim",       text: "drwx------  /etc/jiene/secrets  [you found it]" },
    ],
  }),

  "sudo": () => ({
    lines: [
      { type: "warning", text: "⚠ Permission denied." },
      { type: "dim",     text: "  jiene is not in the sudoers file." },
      { type: "dim",     text: "  This incident will be reported to the Velvet Scribes Concuil." },
    ],
  }),
};

// Главная функция обработки команды
export function executeCommand(
  raw: string,
  profile: Profile | null,
  navigate: ReturnType<typeof useNavigate>
): CommandResult {
  const cmd = raw.trim().toLowerCase();

  // --- Easter eggs ---
  for (const [key, fn] of Object.entries(EASTER_EGGS)) {
    if (cmd === key || cmd.startsWith(key + " ")) return fn(profile);
  }

  // --- Dice roll ---
  if (cmd.startsWith("roll ")) {
    return rollDice(cmd.slice(5).trim());
  }

  // --- Публичные команды ---
  switch (cmd) {
    case "help":
      return {
        lines: [
          { type: "highlight", text: "Доступные заклинания:" },
          { type: "dim",       text: "" },
          { type: "output",    text: "  whoami          — кто такой jiene?" },
          { type: "output",    text: "  about           — страница /about" },
          { type: "output",    text: "  projects        — кодекс проектов" },
          { type: "output",    text: "  lab             — лаборатория идей" },
          { type: "output",    text: "  blog            — хроники записей" },
          { type: "output",    text: "  contact         — каналы связи" },
          { type: "output",    text: "  roll [dice]     — бросить кубик (1d20, 2d6+3)" },
          { type: "output",    text: "  clear           — очистить терминал" },
          { type: "output",    text: "  exit            — закрыть" },
          { type: "dim",       text: "" },
          { type: "dim",       text: "  ... и некоторые команды знают только любопытные." },
        ],
      };

    case "whoami":
      if (!profile) return { lines: [{ type: "dim", text: "Загрузка данных..." }] };
      return {
        lines: [
          { type: "highlight", text: `${profile.name}  ·  alias: ${profile.alias}` },
          { type: "dim",       text: `Role:   ${profile.role}` },
          { type: "dim",       text: `Status: ${profile.status}` },
          { type: "dim",       text: "" },
          { type: "output",    text: `Class:   Technomancer, Lvl 1` },
          { type: "output",    text: `Skills:  ${profile.tags.join(", ")}` },
          { type: "output",    text: `Quest:   This Site` },
        ],
      };

    case "about":
      return { lines: [{ type: "success", text: "✦ Открываю /about..." }], navigate: "/about" };

    case "projects":
      return { lines: [{ type: "success", text: "✦ Открываю кодекс проектов..." }], navigate: "/codex" };

    case "lab":
      return { lines: [{ type: "success", text: "✦ Открываю лабораторию..." }], navigate: "/laboratory" };

    case "blog":
      return { lines: [{ type: "success", text: "✦ Открываю хронику..." }], navigate: "/chronicle" };

    case "contact":
      return {
        lines: [
          { type: "highlight", text: "Каналы связи:" },
          { type: "output",    text: `  email:  ${profile?.links?.email ?? "???"}` },
          { type: "output",    text: `  github: ${profile?.links?.github ?? "github.com/alex-jienexa"}` },
        ],
      };

    case "clear":
      return { lines: [], clear: true };

    case "exit":
      return { lines: [{ type: "dim", text: "Закрываю гримуар..." }], close: true };

    default:
      return {
        lines: [
          { type: "error", text: `Команда не найдена: ${cmd}` },
          { type: "dim",   text: `  Введи 'help' чтобы увидеть список заклинаний.` },
        ],
      };
  }
}
