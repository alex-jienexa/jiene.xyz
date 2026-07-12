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
import s from "./Terminal.module.css";

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
  const [input,      setInput]      = createSignal("");
  const [history,    setHistory]    = createSignal<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = createSignal<string[]>([]);
  const [histIdx,    setHistIdx]    = createSignal(-1);

  let inputRef!: HTMLInputElement;
  let scrollRef!: HTMLDivElement;

  createEffect(() => {
    if (terminalOpen()) setTimeout(() => inputRef?.focus(), 50);
  });

  createEffect(() => {
    history();
    setTimeout(() => { if (scrollRef) scrollRef.scrollTop = scrollRef.scrollHeight; }, 10);
  });

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

    if (result.navigate) setTimeout(() => { closeTerminal(); navigate(result.navigate!); }, 300);
    if (result.close)    setTimeout(closeTerminal, 300);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") { handleSubmit(); return; }
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
      <div class={s.backdrop} onClick={closeTerminal} aria-hidden="true" />

      <div class={s.terminal} role="dialog" aria-label="Grimoire Terminal" aria-modal="true">
        {/* Топбар — dot 10px visual, 40px hit area via negative margin */}
        <div class={s.topbar}>
          <div class={s.dots}>
            <button class={`${s.dot} ${s.dotRed}`}    onClick={closeTerminal} aria-label="Закрыть" />
            <span   class={`${s.dot} ${s.dotYellow}`} aria-hidden="true" />
            <span   class={`${s.dot} ${s.dotGreen}`}  aria-hidden="true" />
          </div>
          <span class={s.label}>grimoire terminal — v0.1.0</span>
        </div>

        <div class={s.body} ref={scrollRef} aria-live="polite" aria-atomic="false">
          <For each={WELCOME}>
            {(line) => (
              <div class={`${s.line} ${
                line.type === "highlight" ? s.lineHighlight :
                line.type === "dim"       ? s.lineDim       : ""
              }`}>{line.text}</div>
            )}
          </For>
          <div class={`${s.line} ${s.lineDim}`}> </div>

          <For each={history()}>
            {(entry) => (
              <>
                <div class={s.line}>
                  <span class={s.prompt}>~</span>
                  <span class={s.cmd}> {entry.input}</span>
                </div>
                <For each={entry.lines}>
                  {(line) => (
                    <div class={`${s.line} ${
                      line.type === "highlight" ? s.lineHighlight :
                      line.type === "dim"       ? s.lineDim       :
                      line.type === "success"   ? s.lineSuccess   :
                      line.type === "warning"   ? s.lineWarning   :
                      line.type === "error"     ? s.lineError     : ""
                    }`}>{line.text}</div>
                  )}
                </For>
                <div class={`${s.line} ${s.lineDim}`}> </div>
              </>
            )}
          </For>

          <div class={s.inputRow}>
            <span class={s.prompt}>~</span>
            <input
              ref={inputRef}
              type="text"
              class={s.input}
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