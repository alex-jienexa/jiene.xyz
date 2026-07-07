import {
  type Component,
  createSignal,
  createEffect,
  For,
  Show,
  onMount,
  onCleanup,
} from "solid-js";
import { useNavigate } from "@solidjs/router";
import { terminalOpen, closeTerminal, profile } from "../../store";
import { executeCommand, type TermLine } from "./commands";

interface HistoryEntry {
  input: string;
  lines: TermLine[];
}

const WELCOME: TermLine[] = [
  { type: "highlight", text: "✦ Добро пожаловать в терминал гримуара." },
  { type: "dim",       text: "  Введи 'help' чтобы открыть список заклинаний." },
];

const Terminal: Component = () => {
  const navigate = useNavigate();
  const [input, setInput]     = createSignal("");
  const [history, setHistory] = createSignal<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = createSignal<string[]>([]);
  const [histIdx, setHistIdx] = createSignal(-1);

  let inputRef!: HTMLInputElement;
  let scrollRef!: HTMLDivElement;

  // Фокус на input при открытии
  createEffect(() => {
    if (terminalOpen()) {
      setTimeout(() => inputRef?.focus(), 50);
    }
  });

  // Автоскролл вниз при новых строках
  createEffect(() => {
    history(); // отслеживаем
    setTimeout(() => {
      if (scrollRef) scrollRef.scrollTop = scrollRef.scrollHeight;
    }, 10);
  });

  // Закрытие по Escape
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && terminalOpen()) closeTerminal();
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  function handleSubmit() {
    const cmd = input().trim();
    if (!cmd) return;

    const result = executeCommand(cmd, profile(), navigate);

    if (result.clear) {
      setHistory([]);
    } else {
      setHistory((h) => [...h, { input: cmd, lines: result.lines }]);
    }

    setCmdHistory((h) => [cmd, ...h].slice(0, 50));
    setHistIdx(-1);
    setInput("");

    if (result.navigate) {
      setTimeout(() => { closeTerminal(); navigate(result.navigate!); }, 300);
    }
    if (result.close) {
      setTimeout(closeTerminal, 300);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") { handleSubmit(); return; }

    // Навигация по истории команд — как в настоящем терминале
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx() + 1, cmdHistory().length - 1);
      setHistIdx(next);
      setInput(cmdHistory()[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx() - 1;
      if (next < 0) { setHistIdx(-1); setInput(""); }
      else { setHistIdx(next); setInput(cmdHistory()[next] ?? ""); }
    }
  }

  return (
    <Show when={terminalOpen()}>
      {/* Backdrop — клик снаружи закрывает терминал */}
      <div class="terminal-backdrop" onClick={closeTerminal} aria-hidden="true" />

      <div
        class="terminal"
        role="dialog"
        aria-label="Grimoire Terminal"
        aria-modal="true"
      >
        {/* Топбар с trafic-light кнопками */}
        <div class="terminal__topbar">
          <div class="terminal__dots">
            <button class="terminal__dot terminal__dot--red"    onClick={closeTerminal} aria-label="Закрыть" />
            <span   class="terminal__dot terminal__dot--yellow" aria-hidden="true" />
            <span   class="terminal__dot terminal__dot--green"  aria-hidden="true" />
          </div>
          <span class="terminal__label">grimoire terminal — v0.1.0</span>
        </div>

        {/* История вывода */}
        <div class="terminal__body" ref={scrollRef}>
          {/* Приветствие */}
          <For each={WELCOME}>
            {(line) => <div class={`term-line term-line--${line.type}`}>{line.text}</div>}
          </For>
          <div class="term-line term-line--dim"> </div>

          {/* Команды и их вывод */}
          <For each={history()}>
            {(entry) => (
              <>
                <div class="term-line">
                  <span class="term-prompt">~</span>
                  <span class="term-cmd"> {entry.input}</span>
                </div>
                <For each={entry.lines}>
                  {(line) => (
                    <div class={`term-line term-line--${line.type}`}>{line.text}</div>
                  )}
                </For>
                <div class="term-line term-line--dim"> </div>
              </>
            )}
          </For>

          {/* Строка ввода */}
          <div class="term-input-row">
            <span class="term-prompt">~</span>
            <input
              ref={inputRef}
              type="text"
              class="term-input"
              value={input()}
              onInput={(e) => setInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck={false}
              aria-label="Ввод команды"
            />
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Terminal;
