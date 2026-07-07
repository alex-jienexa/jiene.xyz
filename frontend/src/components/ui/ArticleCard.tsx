import { type Component } from "solid-js";
import { A } from "@solidjs/router";
import type { ArticleListItem } from "../../types";
import Badge from "./Badge";

interface ArticleCardProps {
  article: ArticleListItem;
  featured?: boolean;
  animDelay?: number;
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split(".").join("-");
}

// Путь статьи зависит от раздела, в котором она живёт
function articlePath(article: ArticleListItem): string {
  if (article.section === "codex" && article.project) {
    return `/codex/${article.project}/${article.slug}`;
  }
  if (article.section === "lab") return `/laboratory/${article.slug}`;
  return `/chronicle/${article.slug}`;
}

const ArticleCard: Component<ArticleCardProps> = (props) => {
  const style = () =>
    props.animDelay !== undefined ? `animation-delay: ${props.animDelay}ms` : "";

  return (
    <A
      href={articlePath(props.article)}
      class={`card animate-fade-up ${props.featured ? "card--featured" : ""}`}
      style={style()}
    >
      <div class="card__meta">
        <span class="card__date">{formatDate(props.article.published_at)}</span>
        <Badge value={props.article.kind} />
      </div>

      <h3 class="card__title">{props.article.title}</h3>

      <footer class="card__foot">
        {props.article.project && (
          <span class="card__project">{props.article.project}</span>
        )}
        {props.article.project && <span class="card__sep"> · </span>}
        <span class="card__kind">{props.article.reading_time_minutes} мин</span>
      </footer>
    </A>
  );
};

export default ArticleCard;
