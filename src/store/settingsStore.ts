import { useSyncExternalStore } from "react";

type Mode = "basic" | "expert";

interface SettingsState {
  autoUpdateEnabled: boolean;
  mode: Mode;
  initialized: boolean;
}

const storageKey = "router-dashboard:settings";

let state: SettingsState = {
  autoUpdateEnabled: true,
  mode: "basic",
  initialized: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined") return;
  const { initialized, ...rest } = state;
  window.localStorage.setItem(storageKey, JSON.stringify(rest));
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSettingsState() {
  return state;
}

export function loadSettingsState() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    state = { ...state, initialized: true };
    emit();
    return;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    state = {
      autoUpdateEnabled: parsed.autoUpdateEnabled ?? true,
      mode: parsed.mode === "expert" ? "expert" : "basic",
      initialized: true,
    };
    emit();
  } catch (err) {
    console.error("[settings] Failed to parse settings state", err);
    state = { ...state, initialized: true };
    emit();
  }
}

export function setAutoUpdateEnabled(enabled: boolean) {
  state = { ...state, autoUpdateEnabled: enabled };
  persist();
  emit();
}

export function setMode(mode: Mode) {
  state = { ...state, mode };
  persist();
  emit();
}

export function toggleMode() {
  setMode(state.mode === "basic" ? "expert" : "basic");
}

export function useSettingsState() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
