// src/pages/ModulePage.tsx
// --------------------------
//
import { moduleByPath } from "../modules/register";
import { useRouter } from "../router";
import NotFoundPage from "./NotFoundPage";
import { createMemo, Show } from "solid-js";

export default function ModulePage() {
  const { path } = useRouter();
  const module = createMemo(() => moduleByPath(path()));

  return (
    <Show when={module()} fallback={<NotFoundPage />}>
      {(module) => (
        <div>
          <p>Рандомная модульная страница</p>
        </div>
      )}
    </Show>
  );
}
