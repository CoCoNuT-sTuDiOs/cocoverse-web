import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

/** A panel of liquid glass. Plain markup, so it renders on the server. */
export function LiquidGlass({ className = "", children }: Props) {
  return (
    <div className={`liquid ${className}`}>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
