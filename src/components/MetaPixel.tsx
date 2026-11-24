"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { META_PIXEL_ID } from "@/config/meta";
import { useConsent } from "@/lib/consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Loads the Meta Pixel in production, outside the admin panel, and tracks client-side navigations.
export default function MetaPixel() {
  const pathname = usePathname();
  const consent = useConsent();
  // Loads only after the visitor accepts advertising cookies (LGPD).
  const enabled = consent === "granted" && Boolean(META_PIXEL_ID) && process.env.NODE_ENV === "production" && !pathname.startsWith("/admin");

  useEffect(() => {
    // The first PageView is sent by the init snippet; later route changes are sent here.
    if (enabled && typeof window.fbq === "function") window.fbq("track", "PageView");
  }, [pathname, enabled]);

  if (!enabled) return null;
  return (
    <Script id="meta-pixel" strategy="lazyOnload">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}
