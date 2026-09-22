"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type ProductEventName } from "@/lib/analytics";

export function ProductEventOnMount({
  name,
  targetId,
  metadata,
}: {
  name: ProductEventName;
  targetId?: string | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void trackEvent(name, { targetId, metadata });
  }, [name, targetId, metadata]);

  return null;
}
