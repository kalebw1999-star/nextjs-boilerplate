"use client";

import { useEffect } from "react";

export default function ClipIQBridge() {
  useEffect(() => {
    const handle = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button) return;
      if (button.textContent?.trim() !== "CLIP IQ") return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign("/clip");
    };
    document.addEventListener("click", handle, true);
    return () => document.removeEventListener("click", handle, true);
  }, []);
  return null;
}
