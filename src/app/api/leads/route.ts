import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMissingSchema } from "@/lib/supabase/missing-schema";
import { allowRequest } from "@/lib/rate-limit";
import { emailButton, emailLayout, getResend, resendFrom } from "@/lib/email/delivery";
import { escapeHtml } from "@/lib/html";
import { FREE_MATERIALS } from "@/constants/free-materials";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const email = clean(body.email, 160).toLowerCase();
    const nome = clean(body.nome, 120);
    const telefone = clean(body.telefone, 20).replace(/\D/g, "");
    const source = clean(body.source, 40) || "atividades";
    const marketingConsent = body.marketingConsent === true;

    if (!emailRegex.test(email)) return NextResponse.json({ error: "Informe um e-mail valido." }, { status: 400 });
    if (!nome) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    if (telefone && (telefone.length < 10 || telefone.length > 11)) {
      return NextResponse.json({ error: "WhatsApp invalido." }, { status: 400 });
    }
    if (!await allowRequest(request, "leads", [["ip", 5, 600], ["global", 300, 3600]])) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
    }

    const { error } = await getSupabaseAdminClient().from("leads").upsert(
      { email, nome, telefone: telefone || null, source, marketing_consent: marketingConsent },
      { onConflict: "email" },
    );
    if (error && !isMissingSchema(error)) throw error;

    // The download is never blocked by e-mail delivery; the e-mail is a convenience copy.
    const resend = getResend();
    if (resend) {
      const site = getSiteUrl();
      const lista = FREE_MATERIALS.map((material) =>
        `<li style="margin-bottom: 8px;"><a href="${escapeHtml(site + material.downloadLink)}">${escapeHtml(material.title)}</a></li>`).join("");
      await resend.emails.send({
        from: resendFrom,
        to: email,
        subject: "🎁 Seus materiais gratuitos da Tia Rafa",
        html: emailLayout(`
          <h2 style="color: #7c3aed;">Olá, ${escapeHtml(nome)}! Aqui estão seus materiais.</h2>
          <ul>${lista}</ul>
          <p>Gostou? Temos atividades prontas para cada data do calendário escolar.</p>
          ${emailButton(`${site}/#catalogo`, "VER MAIS MATERIAIS")}
        `),
      }).catch((sendError: unknown) => console.error("Falha ao enviar materiais gratuitos:", sendError));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao registrar lead:", error);
    return NextResponse.json({ error: "Nao foi possivel enviar agora. Tente novamente." }, { status: 503 });
  }
}
