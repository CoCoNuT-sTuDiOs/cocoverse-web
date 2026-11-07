"use client";

import { Icon } from "@iconify/react";
import type { MouseEvent, ReactNode } from "react";
import { formatCount } from "@/lib/format";
import { useTouchOnly } from "@/lib/useTouchOnly";
import "./phone.css";

export type PhoneProps = {
  /** The asset's URL name, for example "pisces". */
  slug: string;
  /** The asset's display name, shown in the Dynamic Island. */
  name: string;
  views: number;
  copies: number;
  likes: number;
  /** Called when the user opens the asset: the home button, or on a touch screen a tap on the phone body outside the screen. */
  onOpen?: () => void;
  /** The live preview. It fills the screen. */
  children?: ReactNode;
};

function Stat({ icon, value }: { icon: string; value: number }) {
  return (
    <div className="cvp-stat">
      <Icon icon={icon} className="cvp-icon" />
      <span>{formatCount(value)}</span>
    </div>
  );
}

/** An iPhone 8 Plus in clay, with a Dynamic Island and a TikTok-style rail on the right. */
export function Phone({ slug, name, views, copies, likes, onOpen, children }: PhoneProps) {
  const touch = useTouchOnly();

  /** On a touch screen the screen itself plays the asset, so the page opens
   *  from a tap on the phone body anywhere that is not the screen. */
  function onBodyTap(event: MouseEvent<HTMLDivElement>) {
    if (!touch) return;
    const target = event.target as HTMLElement;
    if (target.closest(".cvp-screen") || target.closest(".cvp-home")) return;
    onOpen?.();
  }

  return (
      <div className="cvp" data-asset-slug={slug}>
              <div className="cvp-body" role="group" aria-label={`${name} preview`} onClick={onBodyTap}>
        <span className="cvp-side cvp-vol-up" aria-hidden="true" />
        <span className="cvp-side cvp-vol-down" aria-hidden="true" />
        <span className="cvp-side cvp-power" aria-hidden="true" />
        <span className="cvp-speaker" aria-hidden="true" />

        <div className="cvp-screen" data-phone-screen={slug}>
          <div className="cvp-view">{children}</div>
          <div className="cvp-shade" aria-hidden="true" />
          <div className="cvp-rail" aria-hidden="true">
            <Stat icon="solar:eye-bold" value={views} />
            <Stat icon="solar:bookmark-bold" value={copies} />
            <Stat icon="solar:heart-bold" value={likes} />
          </div>
          <div className="cvp-island">
            <span className="cvp-dot" aria-hidden="true" />
            <span className="cvp-name">{name}</span>
          </div>
        </div>

        <button
          type="button"
          className="cvp-home"
          aria-label={`Open ${name}`}
          onClick={onOpen}
        />
      </div>
    </div>
  );
}