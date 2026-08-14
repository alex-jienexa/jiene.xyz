import { createSignal, createResource, For, Show } from "solid-js";
import {
  getAllArticlesForAdmin,
  getArticleForAdmin,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
} from "../api";
import type { ArticleListItem, ArticleSection, ArticleKind } from "../types";
import { getSession, clearSession } from "../auth/auth.store";
import Badge from "../components/ui/Badge";
import Divider from "../components/ui/Divider";
import s from "./AdminPage.module.css";

const SECTIONS: ArticleSection[] = ["chronicle", "codex", "lab"];
const KINDS: ArticleKind[] = ["article", "devlog", "research", "note", "essay"];

interface FormState {
  title: string;
  section: ArticleSection;
  kind: ArticleKind;
  content: string;
  tagsInput: string; // сырой ввод через запятую — парсится в tags при отправке
}

const emptyForm: FormState = {
  title: "",
  section: "chronicle",
  kind: "article",
  content: "",
  tagsInput: "",
};

/**
 * AdminPage — намеренно один файл, без отдельного registry-паттерна
 * для "модулей админки": сейчас в системе ровно один вид контента
 * (статьи), и заводить механизм регистрации ради одного модуля было бы
 * YAGNI. Когда появится второй раздел (например, управление проектами
 * в /codex), тогда и будет смысл вынести общий AdminLayout с табами —
 * пока это не нужная абстракция.
 */
export default function AdminPage() {
  const [articles, { refetch }] = createResource(getAllArticlesForAdmin);
  const [selectedSlug, setSelectedSlug] = createSignal<string | null>(null);
  const [form, setForm] = createSignal<FormState>(emptyForm);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function selectArticle(item: ArticleListItem | null) {
    setError(null);
    if (!item) {
      setSelectedSlug(null);
      setForm(emptyForm);
      return;
    }
    try {
      const full = await getArticleForAdmin(item.slug);
      setSelectedSlug(full.slug);
      setForm({
        title: full.title,
        section: full.section,
        kind: full.kind,
        content: full.content,
        tagsInput: full.tags.join(", "),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить статью");
    }
  }

  function parsedTags(): string[] {
    return form()
      .tagsInput.split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const f = form();
      const slug = selectedSlug();

      if (slug) {
        await updateArticle(slug, {
          title: f.title,
          section: f.section,
          kind: f.kind,
          content: f.content,
          tags: parsedTags(),
        });
      } else {
        const created = await createArticle({
          title: f.title,
          section: f.section,
          kind: f.kind,
          content: f.content,
          tags: parsedTags(),
        });
        setSelectedSlug(created.slug);
      }
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить статью");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    const slug = selectedSlug();
    if (!slug) return;
    setSaving(true);
    setError(null);
    try {
      await publishArticle(slug);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось опубликовать статью");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const slug = selectedSlug();
    if (!slug) return;
    if (!confirm(`Удалить статью "${form().title}"? Это необратимо.`)) return;

    setSaving(true);
    setError(null);
    try {
      await deleteArticle(slug);
      await selectArticle(null);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить статью");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div class={s.page}>
      <header class={s.header}>
        <p class={s.chapter}>§ sanctum</p>
        <h1 class={s.title}>Админка</h1>
        <p class={s.whoami}>
          вошёл как {getSession()?.username ?? "???"} ·{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); clearSession(); }}>
            выйти
          </a>
        </p>
      </header>

      <Divider />

      <div class={s.layout}>
        <div class={s.list}>
          <button class={s.listItem} onClick={() => selectArticle(null)}>
            + новая статья
          </button>
          <For each={articles()}>
            {(item) => (
              <button
                class={`${s.listItem} ${selectedSlug() === item.slug ? s.listItemActive : ""}`}
                onClick={() => selectArticle(item)}
              >
                {item.title || "(без названия)"}
                <div class={s.listMeta}>
                  <Badge value={item.is_published ? "completed" : "in_progress"} />
                  <Badge value={item.section} />
                </div>
              </button>
            )}
          </For>
        </div>

        <div class={s.form}>
          <div>
            <label class={s.label}>Заголовок</label>
            <input
              class={s.input}
              value={form().title}
              onInput={(e) => setForm({ ...form(), title: e.currentTarget.value })}
              placeholder="Builder of systems..."
            />
          </div>

          <div class={s.row}>
            <div>
              <label class={s.label}>Раздел</label>
              <select
                class={s.select}
                value={form().section}
                onChange={(e) => setForm({ ...form(), section: e.currentTarget.value as ArticleSection })}
              >
                <For each={SECTIONS}>{(sec) => <option value={sec}>{sec}</option>}</For>
              </select>
            </div>
            <div>
              <label class={s.label}>Тип контента</label>
              <select
                class={s.select}
                value={form().kind}
                onChange={(e) => setForm({ ...form(), kind: e.currentTarget.value as ArticleKind })}
              >
                <For each={KINDS}>{(k) => <option value={k}>{k}</option>}</For>
              </select>
            </div>
          </div>

          <div>
            <label class={s.label}>Теги (через запятую)</label>
            <input
              class={s.input}
              value={form().tagsInput}
              onInput={(e) => setForm({ ...form(), tagsInput: e.currentTarget.value })}
              placeholder="pf2e, ml, golang"
            />
          </div>

          <div>
            <label class={s.label}>Содержимое (Markdown)</label>
            <textarea
              class={s.textarea}
              value={form().content}
              onInput={(e) => setForm({ ...form(), content: e.currentTarget.value })}
            />
          </div>

          <Show when={error()}>
            <p class={s.error}>{error()}</p>
          </Show>

          <div class={s.actions}>
            <Show when={selectedSlug()}>
              <button class={`${s.btn} ${s.btnDanger}`} disabled={saving()} onClick={handleDelete}>
                Удалить
              </button>
            </Show>
            <button class={s.btn} disabled={saving()} onClick={handleSave}>
              Сохранить черновик
            </button>
            <Show when={selectedSlug()}>
              <button class={s.btnPrimary} disabled={saving()} onClick={handlePublish}>
                Опубликовать
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
