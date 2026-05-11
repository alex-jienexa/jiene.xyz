// src/pages/HomePage.tsx
// --------------------------
// Основной контент главной страницы, предосталяет компонент `NotebookLayout` для отображения содержимого.

import { NotebookLayout } from "../layout/NotebookLayout";

/**
 * Компонент `HomePage` отображает главную страницу приложения, используя компонент `NotebookLayout`.
 * @returns Компонент домашней страницы
 */
export default function HomePage() {
  return <NotebookLayout />;
}
