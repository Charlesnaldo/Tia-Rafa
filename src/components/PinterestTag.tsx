"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { PINTEREST_TAG_ID } from "@/config/meta";
import { useConsent } from "@/lib/consent";

declare global {
  interface Window {
    pintrk?: (...args: unknown[]) => void;
  }
}

// Pinterest conversion tag: production only, outside /admin, and only after cookie consent (LGPD).
export default function PinterestTag() {
  const pathname = usePathname();
  const consent = useConsent();
  const enabled = consent === "granted" && Boolean(PINTEREST_TAG_ID)
    && process.env.NODE_ENV === "production" && !pathname.startsWith("/admin");

  useEffect(() => {
    // The init snippet records the first page; client-side navigations are recorded here.
    if (enabled && typeof window.pintrk === "function") window.pintrk("page");
  }, [pathname, enabled]);

  if (!enabled) return null;
  return (
    <Script id="pinterest-tag" strategy="lazyOnload">
      {`!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(
Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var
t=document.createElement("script");t.async=!0,t.src=e;var
r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '${PINTEREST_TAG_ID}');
pintrk('page');`}
    </Script>
  );
}
