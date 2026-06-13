"use client";

import { useEffect } from "react";

/** Registers the PWA service worker once on the client. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort */
      });
    }
  }, []);

  return null;
}
