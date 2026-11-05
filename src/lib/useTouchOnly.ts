import { useEffect, useState } from "react";

/** True on a phone or tablet: a touch screen with no hover. */
export function useTouchOnly(): boolean {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return touch;
}