import { lazy } from "solid-js";
export { BASE, tc, isTekCorePath } from "./paths";

export const TekCore = {
  Layout:  lazy(() => import("./Layout")),
  Landing: lazy(() => import("./pages/Landing")),
  Doc:     lazy(() => import("./pages/DocPage")),
  Secret:  lazy(() => import("./pages/Secret")),
};