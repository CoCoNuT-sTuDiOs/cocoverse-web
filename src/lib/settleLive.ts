/** How long the picture stays hidden after it lands in its grid phone, in milliseconds.
 *  Raise it if you still see the effect settling when it fades in. */
const SETTLE_MS = 800;

/** When the live view moves back into its grid phone, Flutter resizes it and the effect
 *  can visibly re-fit for a moment. Keep the picture hidden until it has settled, then fade it in. */
export function hideLiveUntilSettled(from: HTMLElement | null) {
  const host = from?.querySelector<HTMLElement>(".cvp-host");
  if (!host) return;

  host.style.transition = "none";
  host.style.opacity = "0";

  const started = performance.now();
  let landedAt = 0;
  const id = window.setInterval(() => {
    const now = performance.now();
    if (!landedAt && host.closest("[data-cell]")) landedAt = now;
    const settled = landedAt > 0 && now - landedAt > SETTLE_MS;
    if (settled || now - started > 5000) {
      window.clearInterval(id);
      host.style.transition = "opacity 0.6s ease";
      host.style.opacity = "1";
    }
  }, 50);
}