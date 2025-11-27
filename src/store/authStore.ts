import { useSyncExternalStore } from "react";

interface AuthState {
  isAuthenticated: boolean;
  userName?: string;
  firstLogin: boolean;
  showTour: boolean;
  showHCITour: boolean;
  passwordRequiresChange: boolean;
  passwordSkipWarning: boolean;
  passwordLastChangedAt?: number | null;
  initialized: boolean;
}

let state: AuthState = {
  isAuthenticated: false,
  userName: undefined,
  firstLogin: false,
  showTour: false,
  showHCITour: false,
  passwordRequiresChange: false,
  passwordSkipWarning: false,
  passwordLastChangedAt: null,
  initialized: false,
};

const listeners = new Set<() => void>();
const storageKey = "router-dashboard:auth";
const passwordStorageKey = "router-dashboard:password";
const defaultPassword = "admin";

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
      showHCITour: false,
      passwordRequiresChange: Boolean(parsed.passwordRequiresChange),
      passwordSkipWarning: Boolean(parsed.passwordSkipWarning),
      passwordLastChangedAt: parsed.passwordLastChangedAt ?? null,
      initialized: true,
    };
    emit();
  } catch (err) {
    console.error("[auth] Failed to parse auth state", err);
    state = { ...state, initialized: true };
    emit();
  }
}

export function getStoredPassword() {
  if (typeof window === "undefined") return defaultPassword;
  const stored = window.localStorage.getItem(passwordStorageKey);
  return stored || defaultPassword;
}

function setStoredPassword(next: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(passwordStorageKey, next);
}

export function login(userName: string, options?: { usedDefaultPassword?: boolean }) {
  const wasAuthenticated = state.isAuthenticated;
  state = {
    isAuthenticated: true,
    userName,
    firstLogin: !wasAuthenticated,
    showTour: !wasAuthenticated,
    passwordRequiresChange: options?.usedDefaultPassword ?? state.passwordRequiresChange,
    passwordSkipWarning: false,
    passwordLastChangedAt: state.passwordLastChangedAt ?? null,
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

export function startHCITour() {
  state = { ...state, showHCITour: true };
  emit();
}

export function completeHCITour() {
  state = { ...state, showHCITour: false };
  emit();
}

export function logout() {
  state = {
    isAuthenticated: false,
    userName: undefined,
    firstLogin: false,
    showTour: false,
    showHCITour: false,
    passwordRequiresChange: false,
    passwordSkipWarning: false,
    passwordLastChangedAt: null,
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

export function markPasswordChanged(newPassword: string) {
  setStoredPassword(newPassword);
  state = {
    ...state,
    passwordRequiresChange: false,
    passwordSkipWarning: false,
    passwordLastChangedAt: Date.now(),
    firstLogin: false,
  };
  persist();
  emit();
}

export function skipPasswordChange() {
  state = { ...state, passwordSkipWarning: true, passwordRequiresChange: true };
  persist();
  emit();
}

export function useAuthState() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
