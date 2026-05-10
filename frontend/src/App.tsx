// src/App.jsx
// Корень приложения: Router + маршруты.
// Добавить новый маршрут — одна строка <Route>.

import "./styles/global.css";
import { RouteConfig, Router, Routes, useRouter } from "./router";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

const routes: RouteConfig[] = [{ path: "/", component: HomePage }];

export function App() {
  return (
    <Router>
      <Routes routes={routes} fallback={NotFoundPage} />
    </Router>
  );
}
