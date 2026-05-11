// src/modules/register.ts
// --------------------------
//
import type { Component } from "solid-js";

export interface ModuleDefinition {
  id: string;
  path: string;
  label: string;
  icon: string;
  navGroup: "main" | "module";
  component: Component;
}

export const MODULES: ModuleDefinition[] = [
  // Объявление модулей проиходит тут
];

export const moduleByPath = (path: string): ModuleDefinition | undefined =>
  MODULES.find(
    (module) => module.path === path || path.startsWith(module.path + "/"),
  );
