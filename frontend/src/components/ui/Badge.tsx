import { type Component } from "solid-js";
import type { ArticleKind, ProjectStatus } from "../../types";
import s from "./Badge.module.css";

const kindStyles: Record<string, string> = {
  devlog:      "wip",
  research:    "published",
  essay:       "published",
  note:        "note",
  article:     "published",
  in_progress: "wip",
  concept:     "idea",
  completed:   "published",
  abandoned:   "note",
};

const kindLabels: Record<string, string> = {
  devlog:      "devlog",
  research:    "research",
  essay:       "essay",
  note:        "note",
  article:     "article",
  in_progress: "in progress",
  concept:     "concept",
  completed:   "completed",
  abandoned:   "abandoned",
  
  chronicle:   "chronicle",
  codex:       "codex",
  lab:         "lab",
};

interface BadgeProps {
  value: ArticleKind | ProjectStatus | string;
  class?: string;
}

const Badge: Component<BadgeProps> = (props) => {
  const variant = () => kindStyles[props.value] ?? "note";
  const label   = () => kindLabels[props.value] ?? props.value;

  return (
    <span class={`${s.badge} ${s[variant()]} ${props.class ?? ""}`}>
      {label()}
    </span>
  );
};

export default Badge;