import { registerCommand } from "../registry";
import type { CommandResult } from "../types";

// Дайс в нотации PF2e: "1d20", "2d6+3", "1d8-1"
function rollDice(notation: string): CommandResult {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) {
    return { lines: [{ type: "error", text: `⚠ Неверная нотация. Пример: roll 1d20 или roll 2d6+3` }] };
  }

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const mod = match[3] ? parseInt(match[3]) : 0;

  if (count > 100 || sides > 1000) {
    return { lines: [{ type: "warning", text: "⚠ Слишком много кубиков, маг устал метаться кубами." }] };
  }

  const rolls = Array.from({ length: count }, () => Math.ceil(Math.random() * sides));
  const sum = rolls.reduce((a, b) => a + b, 0) + mod;
  const total = Math.max(1, sum);

  const isCrit = sides === 20 && rolls[0] === 20;
  const isCritFail = sides === 20 && rolls[0] === 1;

  const rollStr = rolls.length > 1 ? `[${rolls.join(", ")}]` : String(rolls[0]);
  const modStr = mod !== 0 ? ` ${mod > 0 ? "+" : ""}${mod}` : "";

  const lines: CommandResult["lines"] = [
    { type: "dim", text: `Бросок: ${notation} → ${rollStr}${modStr}` },
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

registerCommand({
  match: "roll",
  help: "roll [dice]    бросить кубик (1d20, 2d6+3)",
  run: (args) => rollDice(args.trim()),
});
