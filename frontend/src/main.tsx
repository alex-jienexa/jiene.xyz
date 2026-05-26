import { render } from "solid-js/web";
import { App } from "./App";
import { MountableElement } from "solid-js/web/types/server.js";

render(() => <App />, document.getElementById("root") as MountableElement);
