import { MountableElement, render } from "solid-js/web";
import { A, Route, Router } from "@solidjs/router";
import Home from "./pages/Home";
import Module from "./pages/Module";

const App = (props: any) => (
  <>
    <nav>
      <A href="/">Домой</A> | <A href="/module">Модуль</A>
    </nav>
    {props.children}
  </>
);

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/module" component={Module} />
    </Router>
  ),
  document.getElementById("root") as MountableElement,
);
