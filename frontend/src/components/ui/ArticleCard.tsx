import { type Component } from "solid-js";
import { A } from "@solidjs/router";
import type { ArticleListItem } from "../../types";
import Badge from "./Badge";
import s from "./ArticleCard.module.css";

interface ArticleCardProps {
  article:    ArticleListItem;
  featured?:  boolean;
  animDelay?: number;
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split(".").join("-");
}

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
      class={`${s.card} animate-fade-up ${props.featured ? s.featured : ""}`}
      style={style()}
    >
      <div class={s.meta}>
        {/* tabular-nums applied in CSS — dates stay stable on sort */}
        <span class={s.date}>{formatDate(props.article.published_at)}</span>
        <Badge value={props.article.kind} />
      </div>

      <h3 class={s.title}>{props.article.title}</h3>

      <footer class={s.foot}>
        {props.article.project && (
          <span class={s.project}>{props.article.project}</span>
        )}
        {props.article.project && <span class={s.sep}> · </span>}
        <span class={s.kind}>{props.article.reading_time_minutes} мин</span>
      </footer>
    </A>
  );
};

export default ArticleCard;