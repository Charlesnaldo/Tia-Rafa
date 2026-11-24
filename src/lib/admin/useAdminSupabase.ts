"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type State = { supabase: SupabaseClient | null; ready: boolean; error: string | null };

// Browser Supabase client with the admin's session; RLS (is_admin) guards every table.
// Redirects to the login page when there is no session.
export function useAdminSupabase() {
  const router = useRouter();
  const [state, setState] = useState<State>(() => {
    try {
      getSupabaseBrowserClient();
      return { supabase: null, ready: false, error: null };
    } catch {
      return { supabase: null, ready: true, error: "Supabase nao configurado (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)." };
    }
  });
  useEffect(() => {
    if (state.error) return;
    let cancelled = false;
    const supabase: SupabaseClient = getSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data.session) {
        router.push("/admin/login");
        return;
      }
      setState({ supabase, ready: true, error: null });
    });
    return () => { cancelled = true; };
  }, [router, state.error]);
  return state;
}
