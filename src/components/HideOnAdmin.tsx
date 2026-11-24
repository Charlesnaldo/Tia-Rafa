"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Store chrome (footer, mobile menu, WhatsApp button) does not belong in the admin panel.
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : <>{children}</>;
}
