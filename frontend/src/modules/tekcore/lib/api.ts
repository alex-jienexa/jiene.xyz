export interface Metric { id: string; label: string; value: number; suffix: string }
export interface Product { id: string; name: string; price: number; description: string; image: string }
export interface Content { metrics: Metric[]; districts: string[]; products: Product[] }

async function getJSON<T>(url: string, ms = 2500): Promise<T> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } finally { clearTimeout(t); }
}

// Бэкенд -> при любой ошибке предзаданный файл. Сайт живёт и без сервера.
export async function loadContent(): Promise<Content> {
  try { return await getJSON<Content>("/api/content"); }
  catch { return await getJSON<Content>("/data/content.json"); }
}

export async function submitApplication(p: { name: string; district: string; reason: string; consent: boolean }) {
  const r = await fetch("/api/applications", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error(String(r.status));
}
