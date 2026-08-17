import { registerCommand, getCommands } from "../registry"
import type { CommandResult } from "../types";

registerCommand({
  match: "help",
  help: "help           список всех заклинаний",
  run(): CommandResult {
    // Список собирается из реестра автоматически — добавив новую
    // команду с полем `help`, не нужно вручную дописывать её сюда.
    const visible = getCommands().filter((c) => !c.hidden && c.help);
    return {
      lines: [
        { type: "highlight", text: "Доступные заклинания:" },
        { type: "dim", text: "" },
        ...visible.map((c) => ({ type: "output" as const, text: `  ${c.help}` })),
        { type: "dim", text: "" },
        { type: "dim", text: "  ... и некоторые команды знают только любопытные." },
      ],
    };
  },
});

registerCommand({
  match: "whoami",
  help: "whoami         кто такой jiene?",
  run(_args, ctx): CommandResult {
    const { profile } = ctx;
    if (!profile) return { lines: [{ type: "dim", text: "Загрузка данных..." }] };
    return {
      lines: [
        { type: "highlight", text: `${profile.name}; alias: ${profile.alias}` },
        { type: "dim", text: `Role:     ${profile.role}` },
        { type: "dim", text: `Status:   ${profile.status}` },
        { type: "dim", text: "" },
        { type: "output", text: `Class:     Technomancer, Lvl 1` },
        { type: "output", text: `Skills:    ${profile.tags.join(", ")}` },
        { type: "output", text: `Quest:     This Site` },
      ],
    };
  },
});

registerCommand({
  match: "about",
  help: "about          страница /about",
  run: () => ({ lines: [{ type: "success", text: "✦ Открываю /about..." }], navigate: "/about" }),
});

registerCommand({
  match: "projects",
  help: "projects       кодекс проектов",
  run: () => ({ lines: [{ type: "success", text: "✦ Открываю кодекс проектов..." }], navigate: "/codex" }),
});

registerCommand({
  match: "lab",
  help: "lab            лаборатория идей",
  run: () => ({ lines: [{ type: "success", text: "✦ Открываю лабораторию..." }], navigate: "/laboratory" }),
});

registerCommand({
  match: "blog",
  help: "blog           хроники записей",
  run: () => ({ lines: [{ type: "success", text: "✦ Открываю хронику..." }], navigate: "/chronicle" }),
});

registerCommand({
  match: "contact",
  help: "contact        каналы связи",
  run(_args, ctx): CommandResult {
    const { profile } = ctx;
    return {
      lines: [
        { type: "highlight", text: "Каналы связи:" },
        { type: "output", text: `  email:  ${profile?.links?.email ?? "???"}` },
        { type: "output", text: `  github: ${profile?.links?.github ?? "github.com/alex-jienexa"}` },
      ],
    };
  },
});

registerCommand({
  match: "clear",
  help: "clear          очистить терминал",
  run: () => ({ lines: [], clear: true }),
});

registerCommand({
  match: "exit",
  help: "exit           закрыть",
  run: () => ({ lines: [{ type: "dim", text: "Закрываю гримуар..." }], close: true }),
});
