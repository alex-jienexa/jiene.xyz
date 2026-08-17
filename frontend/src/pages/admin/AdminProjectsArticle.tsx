import { createSignal, createResource, For, Show } from "solid-js";
import { getProjects, createProject, updateProject, deleteProject } from "../../api";
import type { Project, ProjectStatus } from "../../types";
import Badge from "../../components/ui/Badge";
import s from "../AdminPage.module.css";

const STATUSES: ProjectStatus[] = ["concept", "in_progress", "completed", "abandoned"];

interface FormState {
  title: string;
  description: string;
  status: ProjectStatus;
}

const emptyForm: FormState = { title: "", description: "", status: "concept" };

export default function AdminProjectsPage() {
  const [projects, { refetch }] = createResource(getProjects);
  const [selectedSlug, setSelectedSlug] = createSignal<string | null>(null);
  const [form, setForm] = createSignal<FormState>(emptyForm);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  function selectProject(p: Project | null) {
    setError(null);
    if (!p) {
      setSelectedSlug(null);
      setForm(emptyForm);
      return;
    }
    setSelectedSlug(p.slug);
    setForm({ title: p.title, description: p.description, status: p.status });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const f = form();
      const slug = selectedSlug();

      if (slug) {
        await updateProject(slug, { title: f.title, description: f.description, status: f.status });
      } else {
        const created = await createProject({ title: f.title, description: f.description, status: f.status });
        setSelectedSlug(created.slug);
      }
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить проект");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const slug = selectedSlug();
    if (!slug) return;
    if (!confirm(`Удалить проект "${form().title}"? Статьи проекта не удалятся, но потеряют привязку.`)) return;

    setSaving(true);
    setError(null);
    try {
      await deleteProject(slug);
      selectProject(null);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить проект");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div class={s.layout}>
      <div class={s.list}>
        <button class={s.listItem} onClick={() => selectProject(null)}>
          + новый проект
        </button>

        <Show when={projects()} fallback={<p class={s.listEmpty}>Загрузка...</p>}>
          <Show
            when={(projects() ?? []).length > 0}
            fallback={<p class={s.listEmpty}>Проектов пока нет.</p>}
          >
            <For each={projects()}>
              {(p) => (
                <button
                  class={`${s.listItem} ${selectedSlug() === p.slug ? s.listItemActive : ""}`}
                  onClick={() => selectProject(p)}
                >
                  {p.title}
                  <div class={s.listMeta}>
                    <Badge value={p.status} />
                  </div>
                </button>
              )}
            </For>
          </Show>
        </Show>
      </div>

      <div class={s.form}>
        <div>
          <label class={s.label}>Название</label>
          <input
            class={s.input}
            value={form().title}
            onInput={(e) => setForm({ ...form(), title: e.currentTarget.value })}
            placeholder="Pathfinder AI"
          />
        </div>

        <div>
          <label class={s.label}>Статус</label>
          <select
            class={s.select}
            value={form().status}
            onChange={(e) => setForm({ ...form(), status: e.currentTarget.value as ProjectStatus })}
          >
            <For each={STATUSES}>{(st) => <option value={st}>{st}</option>}</For>
          </select>
        </div>

        <div>
          <label class={s.label}>Описание</label>
          <textarea
            class={s.textarea}
            style="min-height: 140px; font-family: var(--font-sans); font-size: 14px;"
            value={form().description}
            onInput={(e) => setForm({ ...form(), description: e.currentTarget.value })}
            placeholder="ИИ-агент для Pathfinder 2e..."
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
          <button class={`${s.btn} ${s.btnPrimary}`} disabled={saving()} onClick={handleSave}>
            {selectedSlug() ? "Сохранить" : "Создать проект"}
          </button>
        </div>
      </div>
    </div>
  );
}