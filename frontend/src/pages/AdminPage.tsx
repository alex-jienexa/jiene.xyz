import { createSignal, createResource, For, Show, createMemo } from "solid-js";
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
import { markdownToHtml } from "../lib/markdown";
import Badge from "../components/ui/Badge";
import Divider from "../components/ui/Divider";
import articleStyles from "./ArticlePage.module.css";
import s from "./AdminPage.module.css";

const SECTIONS: ArticleSection[] = ["chronicle", "codex", "lab"];
const KINDS: ArticleKind[] = ["article", "devlog", "research", "note", "essay"];

type StatusFilter = "all" | "published" | "draft";
type SectionFilter = ArticleSection | "all";

interface FormState {
  title: string;
  section: ArticleSection;
  kind: ArticleKind;
  content: string;
  tagsInput: string; // сырой ввод через запятую — парсится в tags при отправке
  isPublished: boolean;
}

const emptyForm: FormState = {
  title: "",
  section: "chronicle",
  kind: "article",
  content: "",
  tagsInput: "",
  isPublished: false,
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
  const [tab, setTab] = createSignal<"edit" | "preview">("edit");

  // --- Фильтры списка ---
  // Клиентские, не походы на бэкенд: список статей у одного автора
  // никогда не будет настолько большим, чтобы это стало проблемой,
  // а простота важнее здесь больше, чем экономия одного fetch.
  const [filterSection, setFilterSection] = createSignal<SectionFilter>("all");
  const [filterStatus, setFilterStatus] = createSignal<StatusFilter>("all");
  const [filterQuery, setFilterQuery] = createSignal("");

  const filteredArticles = createMemo(() => {
    const list = articles() ?? [];
    const q = filterQuery().trim().toLowerCase();
    return list.filter((a) => {
      if (filterSection() !== "all" && a.section !== filterSection()) return false;
      if (filterStatus() === "published" && !a.is_published) return false;
      if (filterStatus() === "draft" && a.is_published) return false;
      if (q && !a.title.toLowerCase().includes(q)) return false;
      return true;
    });
  });

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
        isPublished: full.is_published,
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
      setForm({ ...form(), isPublished: true });
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось опубликовать статью");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    const slug = selectedSlug();
    if (!slug) return;
    setSaving(true);
    setError(null);
    try {
      await updateArticle(slug, { is_published: false });
      setForm({ ...form(), isPublished: false });
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось снять статью с публикации");
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

  function saveButtonLabel(): string {
    if (!selectedSlug()) return "Создать черновик";
    return form().isPublished ? "Сохранить изменения" : "Сохранить черновик";
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

          <div class={s.filters}>
            <input
              class={s.filterInput}
              placeholder="поиск по заголовку..."
              value={filterQuery()}
              onInput={(e) => setFilterQuery(e.currentTarget.value)}
            />
            <div class={s.filterRow}>
              <select
                class={s.filterSelect}
                value={filterSection()}
                onChange={(e) => setFilterSection(e.currentTarget.value as SectionFilter)}
              >
                <option value="all">все разделы</option>
                <For each={SECTIONS}>{(sec) => <option value={sec}>{sec}</option>}</For>
              </select>
              <select
                class={s.filterSelect}
                value={filterStatus()}
                onChange={(e) => setFilterStatus(e.currentTarget.value as StatusFilter)}
              >
                <option value="all">все статусы</option>
                <option value="published">опубликовано</option>
                <option value="draft">черновики</option>
              </select>
            </div>
          </div>

          <Show when={articles()} fallback={<p class={s.listEmpty}>Загрузка...</p>}>
            <Show
              when={filteredArticles().length > 0}
              fallback={<p class={s.listEmpty}>Ничего не найдено по этим фильтрам.</p>}
            >
              <For each={filteredArticles()}>
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
            </Show>
          </Show>
        </div>

        <div class={s.form}>

          <div class={s.formHeader}>
            <label class={s.label}>Заголовок</label>
            <Show when={selectedSlug()}>
              <Badge value={form().isPublished ? "completed" : "in_progress"} />
            </Show>
          </div>
          <input
            class={s.input}
            value={form().title}
            onInput={(e) => setForm({ ...form(), title: e.currentTarget.value })}
            placeholder="Builder of systems..."
          />

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
            <div class={s.contentHeader}>
                <label class={s.label}>Содержимое (Markdown)</label>
                <div class={s.tabs}>
                  <button
                    type="button"
                    class={`${s.tabBtn} ${tab() === "edit" ? s.tabBtnActive : ""}`}
                    onClick={() => setTab("edit")}
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    class={`${s.tabBtn} ${tab() === "preview" ? s.tabBtnActive : ""}`}
                    onClick={() => setTab("preview")}
                  >
                    Предпросмотр
                  </button>
                </div>
            </div>

            <Show
              when={tab() === "edit"}
              fallback={
                <div
                  class={`${s.previewBox} ${articleStyles.body}`}
                  innerHTML={markdownToHtml(form().content) || "<p style=\"opacity:.5\">Пока пусто.</p>"}
                />
              }
            >
              <textarea
                class={s.textarea}
                value={form().content}
                onInput={(e) => setForm({ ...form(), content: e.currentTarget.value })}
              />
            </Show>
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
              {saveButtonLabel()}
            </button>
            <Show when={selectedSlug() && !form().isPublished}>
              <button class={`${s.btn} ${s.btnPrimary}`} disabled={saving()} onClick={handlePublish}>
                Опубликовать
              </button>
            </Show>
            <Show when={selectedSlug() && form().isPublished}>
              <button class={s.btn} disabled={saving()} onClick={handleUnpublish}>
                Снять с публикации
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
