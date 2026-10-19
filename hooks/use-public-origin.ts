"use client";

import { useEffect, useState } from "react";

const CONFIGURED_ORIGIN = process.env.NEXT_PUBLIC_HOST_URL ?? "";

/**
 * Origin that install snippets should point at. NEXT_PUBLIC_HOST_URL is inlined
 * at build time, so a first deploy has no value for it yet; fall back to the
 * origin the dashboard is being viewed from. Resolved in an effect to keep the
 * server-rendered markup and the first client render identical.
 */
export function usePublicOrigin() {
  const [origin, setOrigin] = useState(CONFIGURED_ORIGIN);

  useEffect(() => {
    if (!CONFIGURED_ORIGIN) {
      setOrigin(window.location.origin);
    }
  }, []);

  return origin;
}
