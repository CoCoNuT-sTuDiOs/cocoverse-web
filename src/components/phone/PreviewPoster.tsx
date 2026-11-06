import "./phone.css";

/** What a phone shows before its live preview is ready, and for good on a touch screen. */
export function PreviewPoster({ still = false }: { still?: boolean }) {
  return <div className={still ? "cvp-poster cvp-poster-still" : "cvp-poster"} aria-hidden="true" />;
}