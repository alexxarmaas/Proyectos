"use client";

import type { ReactNode } from "react";
import { trackEvent, type ProductEventName } from "@/lib/analytics";

export function TrackedContactLink({
  href,
  className,
  eventName,
  targetId,
  children,
  target,
  rel,
}: {
  href: string;
  className?: string;
  eventName: Extract<ProductEventName, "contact_whatsapp" | "contact_phone">;
  targetId: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => void trackEvent(eventName, { targetId })}
    >
      {children}
    </a>
  );
}
