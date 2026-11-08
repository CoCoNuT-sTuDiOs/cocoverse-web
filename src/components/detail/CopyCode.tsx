"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

export function CopyCode({ code, onCopied }: { code: string; onCopied?: () => void }) {
const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setDone(true);
      onCopied?.();
      window.setTimeout(() => setDone(false), 1800);
    } catch {}
  }

  return (
    <button type="button" onClick={copy} className="btn-gold">
      <Icon icon={done ? "solar:check-circle-bold" : "solar:copy-bold"} width={20} />
      {done ? "Copied" : "Get code"}
    </button>
  );
}