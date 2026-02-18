import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const resendFrom = process.env.RESEND_FROM || "Tia Rafa <onboarding@resend.dev>";

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY nao configurada." }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      return NextResponse.json({ error: "Token nao informado." }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Token invalido." }, { status: 401 });
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Sem permissao de admin." }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { to?: string };
    const to = body.to?.trim() || process.env.TEST_EMAIL_TO;
    if (!to) {
      return NextResponse.json({ error: "Informe um e-mail destino ou configure TEST_EMAIL_TO." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to,
      subject: "Teste de envio - Tia Rafa",
      html: `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2>Teste de e-mail em producao</h2>
          <p>Seu envio via Resend esta funcionando.</p>
          <p><strong>Data:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
      text: `Teste de e-mail em producao. Data: ${new Date().toISOString()}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Falha ao enviar e-mail de teste." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id || null, to });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Erro ao enviar e-mail de teste.", details: message }, { status: 500 });
  }
}
