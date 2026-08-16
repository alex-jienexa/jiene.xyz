import { createSignal, Show } from "solid-js";
import { getSession, clearSession } from "../auth/auth.store";
import Divider from "../components/ui/Divider";
import AdminArticlesPage from "./admin/AdminPageArticle";
import s from "./AdminPage.module.css";

type Tab = "articles" | "projects"; 

/**
 * AdminPage — делаем теперь тонкий слой, где основной контент определён
 * в его модулях. Такая содержательная логика содержится в `admin/*.tsx`
 */
export default function AdminPage() {
  const [tab, setTab] = createSignal<Tab>("articles");

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

      <div class={s.tabs} style="margin-top: 16px;">
        <button
          type="button"
          class={`${s.tabBtn} ${tab() === "articles" ? s.tabBtnActive : ""}`}
          onClick={() => setTab("articles")}
        >
          Статьи
        </button>
        <button
          type="button"
          class={`${s.tabBtn} ${tab() === "projects" ? s.tabBtnActive : ""}`}
          onClick={() => setTab("projects")}
        >
          Проекты
        </button>
      </div>


      <Divider />

      {/* Подключаем содержательную логику админки */}
      <Show when={tab() === "articles"}>
        <AdminArticlesPage />
      </Show>
    </div>
  );
}
