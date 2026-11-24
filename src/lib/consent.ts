"use client";

import { useSyncExternalStore } from "react";

// Visitor's choice about analytics and advertising cookies (LGPD).
// Google Analytics and the Meta Pixel only load after "granted".
export type Consent = "granted" | "denied" | null;

const STORAGE_KEY = "tiarafa_cookie_consent";
const CHANGE_EVENT = "tiarafa:consent-change";
export const OPEN_CONSENT_EVENT = "tiarafa:open-consent";

export function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Exclude<Consent, null>) {
  const previous = readConsent();
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode: the choice lasts for this page view only.
  }
  // Scripts that already loaded cannot be unloaded: reload so a withdrawal takes effect at once.
  if (previous === "granted" && value === "denied") {
    window.location.reload();
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Server render and first client render agree on "undecided" (null) to avoid hydration mismatches.
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, readConsent, () => null);
}
