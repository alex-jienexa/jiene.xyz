import { createSignal } from "solid-js";

export interface Session {
    token: string;
    role: string;
    userId: number;
    username: string;
}

const STORAGE_KEY = "grimoire.session";

function loadInitialSession(): Session | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
        return null;
    }
}

const [session, setSessionSignal] = createSignal<Session | null>(loadInitialSession());

export function getSession() {
    return session();
}

export function isAdmin(): boolean {
    return session()?.role === "admin";
}

export function setSession(next: Session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSessionSignal(next);
}

export function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    setSessionSignal(null);
}

export { session as sessionSignal };