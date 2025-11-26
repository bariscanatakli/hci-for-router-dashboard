import { useSyncExternalStore } from "react";

interface AuthState {
  isAuthenticated: boolean;
  userName?: string;
  firstLogin: boolean;
  showTour: boolean;
  initialized: boolean;
}

let state: AuthState = {
  isAuthenticated: false,
  userName: undefined,
  firstLogin: false,
  showTour: false,
  initialized: false,
};

const listeners = new Set<() => void>();
const storageKey = "router-dashboard:auth";

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined") return;
  const rest = { ...state };
  delete (rest as Partial<AuthState>).initialized;
  window.localStorage.setItem(storageKey, JSON.stringify(rest));
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthState() {
  return state;
}

export function loadAuthState() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    state = { ...state, initialized: true };
    emit();
    return;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    state = {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      userName: parsed.userName,
      firstLogin: Boolean(parsed.firstLogin),
      showTour: Boolean(parsed.showTour),
      initialized: true,
    };
    emit();
  } catch (err) {
    console.error("[auth] Failed to parse auth state", err);
    state = { ...state, initialized: true };
    emit();
  }
}

export function login(userName: string) {
  const wasAuthenticated = state.isAuthenticated;
  state = {
    isAuthenticated: true,
    userName,
    firstLogin: !wasAuthenticated,
    showTour: !wasAuthenticated,
    initialized: true,
  };
  persist();
  emit();
}

export function startTour() {
  state = { ...state, showTour: true, firstLogin: false };
  persist();
  emit();
}

export function logout() {
  state = {
    isAuthenticated: false,
    userName: undefined,
    firstLogin: false,
    showTour: false,
    initialized: true,
  };
  persist();
  emit();
}

export function completeTour() {
  state = { ...state, showTour: false, firstLogin: false };
  persist();
  emit();
}

export function useAuthState() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
