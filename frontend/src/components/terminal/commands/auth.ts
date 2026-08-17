import { registerCommand } from "../registry";
import type { CommandResult } from "../types";
import { login as loginRequest } from "../../../api";
import { setSession, clearSession, getSession } from "../../../auth/auth.store";

/**
 * login — единственная команда терминала, которой нужно больше одного
 * шага ввода. Механизм: run() не завершает диалог сразу, а возвращает
 * `awaitInput.resume` — Terminal.tsx запомнит эту функцию и вызовет её
 * на следующий Enter вместо executeCommand. Так получаем классический
 * "username: / password:" в терминале, не меняя общую архитектуру
 * (CommandResult остаётся синхронным контрактом для всех остальных команд).
 *
 * Третий шаг (resume пароля) — async, потому что там реальный запрос
 * к /api/auth/login. Await допустим в CommandResult.awaitInput.resume
 * по контракту (см. types.ts).
 */
registerCommand({
  match: "login",
  help: "login        войти как автор гримуара",
  run(): CommandResult {
    if (getSession()) {
      return { lines: [{ type: "dim", text: "Ты уже вошёл. Введи 'logout', чтобы сменить личность." }] };
    }

    return {
      lines: [{ type: "dim", text: "identify yourself." }, { type: "highlight", text: "username:" }],
      awaitInput: {
        resume: (username): CommandResult => {
          const trimmedUsername = username.trim();
          if (!trimmedUsername) {
            return { lines: [{ type: "error", text: "⚠ Имя не может быть пустым. login отменён." }] };
          }

          return {
            lines: [{ type: "highlight", text: "password:" }],
            awaitInput: {
              mask: true,
              resume: async (password): Promise<CommandResult> => {
                try {
                  const res = await loginRequest(trimmedUsername, password);
                  setSession({
                    token: res.token,
                    role: res.role,
                    userId: res.user_id,
                    username: res.username,
                  });
                  return {
                    lines: [{ type: "success", text: `✦ welcome back, ${res.username}.` }],
                    navigate: "/admin",
                  };
                } catch {
                  return {
                    lines: [{ type: "warning", text: "⚠ access denied. the wards hold." }],
                  };
                }
              },
            },
          };
        },
      },
    };
  },
});

registerCommand({
  match: "admin",
  help: "admin        перейти в админку (если был выполнен вход)",
  run(): CommandResult {
    if (!getSession()) {
      return {
        lines: [{ type: "warning", text: "Вход не выполнен, совершите `login`" }],
      };
    }
    return { lines: [{ type: "success", text: "✦ Открываю святилище..." }], navigate: "/admin" };
  },
});

registerCommand({
  match: "logout",
  help: "logout        выйти из сессии автора",
  run(): CommandResult {
    if (!getSession()) {
      return { lines: [{ type: "dim", text: "Ты и так не был внутри." }] };
    }
    clearSession();
    return { lines: [{ type: "success", text: "✦ session closed." }] };
  },
});
