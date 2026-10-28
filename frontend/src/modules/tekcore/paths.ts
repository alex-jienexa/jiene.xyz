export const BASE = "/nanograd/tekcore";
export const tc = (p = "") => BASE + p;               // tc("/docs/guide")
export const isTekCorePath = (s: string) => s === BASE || s.startsWith(BASE + "/");