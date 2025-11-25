import { useSyncExternalStore } from "react";

interface SettingsState {
  autoUpdateEnabled: boolean;
}

let state: SettingsState = {
  autoUpdateEnabled: true,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSettingsState() {
  return state;
}

export function setAutoUpdateEnabled(enabled: boolean) {
  state = { ...state, autoUpdateEnabled: enabled };
  emit();
}

export function useSettingsState() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
