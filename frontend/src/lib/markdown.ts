// Markdown → HTML — без внешних зависимостей.
// Для production заменить на marked / remark.
export function markdownToHtml(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre data-lang="${lang}"><code>${escapeHtml(code.trim())}</code></pre>`
    )
    .replace(/`([^`]+)`/g, `<code>$1</code>`)
    .replace(/^## (.+)$/gm, `<h2>$1</h2>`)
    .replace(/^### (.+)$/gm, `<h3>$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^(?!<h[23]|<pre|<ul|<ol|<li|<block)(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
