import { useSyncExternalStore } from "react";

let active: string | null = null;
const listeners = new Set<() => void>();

/** Which phone is awake. Only one can be, ever. */
export const activePhone = {
  get: () => active,
  set(slug: string | null) {
    if (active === slug) return;
    active = slug;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useActivePhone(): string | null {
  return useSyncExternalStore(activePhone.subscribe, activePhone.get, () => null);
}