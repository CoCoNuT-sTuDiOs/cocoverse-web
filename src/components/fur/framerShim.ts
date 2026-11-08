export const ControlType = new Proxy({}, { get: (_target, key) => String(key) }) as Record<string, string>;

export function addPropertyControls(_component: unknown, _controls: unknown): void {}