export type FlutterApp = {
  addView(options: { hostElement: HTMLElement; initialData?: Record<string, unknown> }): number;
  removeView(viewId: number): unknown;
};

declare global {
  interface Window {
    __cocoverseFlutter?: FlutterApp;
    cocoverseSetActive?: (viewId: number, active: boolean) => void;
  }
}

let loading: Promise<FlutterApp> | null = null;

/** Starts the one Flutter engine, the first time any phone asks for it. */
export function loadFlutter(): Promise<FlutterApp> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.__cocoverseFlutter) return Promise.resolve(window.__cocoverseFlutter);
  if (loading) return loading;

  loading = new Promise<FlutterApp>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      loading = null;
      reject(new Error("Flutter did not start in time"));
    }, 30000);
    window.addEventListener(
      "cocoverse-flutter-ready",
      () => {
        window.clearTimeout(timeout);
        if (window.__cocoverseFlutter) resolve(window.__cocoverseFlutter);
      },
      { once: true },
    );
    const script = document.createElement("script");
    script.src = "/flutter/flutter_bootstrap.js";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      loading = null;
      reject(new Error("Could not load /flutter/flutter_bootstrap.js"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

let chain: Promise<unknown> = Promise.resolve();
const GAP = () => new Promise((resolve) => setTimeout(resolve, 350));

/** Runs tasks one at a time, a moment apart, so a screenful of phones does not all start at once. */
export function enqueueView<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.then(GAP, GAP);
  return run;
}