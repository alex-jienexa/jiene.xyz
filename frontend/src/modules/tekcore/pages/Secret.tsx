import { onMount, onCleanup } from "solid-js";

export default function Secret() {
  onMount(() => { scrollTo(0, 0); const t = document.title; document.title = "—"; 
  onCleanup(() => (document.title = t)); });
  return <main class="secret">тебе нельзя.</main>;
}
