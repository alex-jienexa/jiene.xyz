import { registerCommand } from "../registry";

registerCommand({
  match: "invoke pathfinder",
  hidden: true,
  run: () => ({
    lines: [
      { type: "warning", text: "⚠ Заклинание ещё даже не начиналось." },
      { type: "dim", text: "  Глава I ещё пишется. Возвращайся позже." },
      { type: "dim", text: "  Или напиши: contact" },
    ],
  }),
});

registerCommand({
  match: "cat /etc/jiene/secrets",
  hidden: true,
  run: () => ({
    lines: [
      { type: "dim", text: "Reading /etc/jiene/secrets..." },
      { type: "highlight", text: "  alias: jiene" },
      { type: "highlight", text: "  true_class: Technomancer" },
      { type: "highlight", text: "  current_quest: Pathfinder AI — Phase 1" },
      { type: "dim", text: "  hidden_stat: charisma +0" },
      { type: "success", text: "✦ Ты нашёл это. Любопытство — хорошее заклинание." },
    ],
  }),
});

registerCommand({
  match: "ls -la",
  hidden: true,
  run: () => ({
    lines: [
      { type: "dim", text: "drwxr-xr-x  jiene staff  grimoire/" },
      { type: "highlight", text: "-rw-r--r--  §this_site          [somewhen]" },
      { type: "dim", text: "-rw-r--r--  §prologue           [???]" },
      { type: "dim", text: "drwx------  /etc/jiene/secrets  [you found it]" },
    ],
  }),
});

registerCommand({
  match: "sudo",
  hidden: true,
  run: () => ({
    lines: [
      { type: "warning", text: "⚠ Permission denied." },
      { type: "dim", text: "  jiene is not in the sudoers file." },
      { type: "dim", text: "  This incident will be reported to the Velvet Scribes Concuil." },
    ],
  }),
});
