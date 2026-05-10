// src/App.jsx
// Корень приложения: Router + маршруты.
// Добавить новый маршрут — одна строка <Route>.

import "./styles/global.css";
import { Router, Routes, useRouter } from "./router";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// Обёртка путей приложения
function AppRoutes() {
  const { path } = useRouter();

  return (
    <Routes
      routes={[
        { path: "/", component: HomePage },
        { path: "/404", component: NotFoundPage },
      ]}
    />
  );
}

export function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
