import { type Component } from "solid-js";
import s from "./Tag.module.css";

interface TagProps {
  label:    string;
  variant?: "purple" | "gray";
}

// Sigil — гримуарное название для тегов (из design document)
const Tag: Component<TagProps> = (props) => {
  const variant = () => props.variant ?? "purple";
  return (
    <span class={`${s.sigil} ${s[variant()]}`}>{props.label}</span>
  );
};

export default Tag;