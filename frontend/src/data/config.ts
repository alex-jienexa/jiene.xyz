// ========== Навигация ==========

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "about", label: "О себе", icon: "👤" },
];
