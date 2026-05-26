// src/App.jsx
// --------------------------
// Корень приложения: Router + маршруты.
// Добавить новый маршрут = добавить один элемент в массив `routes`.

import "./styles/global.css";
import { RouteConfig, Router, Routes } from "./router";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import { JSX } from "solid-js/h/jsx-runtime";

const routes: RouteConfig[] = [{ path: "/", component: HomePage }];

/**
 * Основной компонент приложения, который содержит все основные страницы приложения.
 * Загружает маршруты из массива `routes` и отображает соответствующий компонент в зависимости от текущего пути.
 * Если путь не найден, отображается страница 404, см. {@link NotFoundPage} для деталей.
 *
 * Чтобы добавить новый маршрут, добавьте один элемент в массив `routes` в {@link src/App.tsx}, указав путь и отображаемый компонент.
 * @returns {JSX.Element} Компонент приложения
 */
export function App(): JSX.Element {
  return (
    <Router>
      <Routes routes={routes} fallback={NotFoundPage} />
    </Router>
  );
}
