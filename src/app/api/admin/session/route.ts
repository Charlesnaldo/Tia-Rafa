import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createAdminSessionPayload,
  getAdminSessionCookieName,
  signAdminSession,
} from "@/lib/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SessionRequest = {
  accessToken?: string;
};

function getAnonSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase nao configurado.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SessionRequest;
    const accessToken = body.accessToken?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: "Token de acesso ausente." }, { status: 400 });
    }

    const supabase = getAnonSupabaseClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    const user = data.user;

    if (error || !user) {
      return NextResponse.json({ error: "Sessao invalida." }, { status: 401 });
    }

    const adminSupabase = getSupabaseAdminClient();
    const { data: adminUser } = await adminSupabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminUser) {
      return NextResponse.json({ error: "Usuario nao autorizado." }, { status: 403 });
    }

    const sessionValue = await signAdminSession(createAdminSessionPayload(user.id));
    const response = NextResponse.json({ ok: true });
    response.cookies.set(getAdminSessionCookieName(), sessionValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("Falha ao criar sessao admin:", error);
    return NextResponse.json({ error: "Falha ao criar sessao admin." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
