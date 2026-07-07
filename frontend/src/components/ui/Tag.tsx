import { type Component } from "solid-js";

interface TagProps {
  label: string;
  variant?: "purple" | "gray";
}

// Sigil — гримуарное название для тегов (из design document)
const Tag: Component<TagProps> = (props) => {
  const variant = () => props.variant ?? "purple";
  return (
    <span class={`sigil sigil--${variant()}`}>{props.label}</span>
  );
};

export default Tag;
