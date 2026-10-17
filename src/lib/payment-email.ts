import { createHash } from "node:crypto";
import type { Resend } from "resend";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type EmailPayload = Parameters<Resend["emails"]["send"]>[0];

export async function sendPaymentEmailOnce(resend: Resend, paymentId: string, productId: string, email: EmailPayload) {
  const supabase = getSupabaseAdminClient();
  // JSON-compatible attachments ensure every retry uses identical bytes and links.
  const payload = {
    ...email,
    attachments: email.attachments?.map((attachment) => ({
      ...attachment,
      content: Buffer.isBuffer(attachment.content) ? attachment.content.toString("base64") : attachment.content,
    })),
  };
  const { data: claim, error } = await supabase.rpc("claim_payment_email", {
    p_payment_id: paymentId, p_product_id: productId, p_payload: payload,
  });
  if (error || !claim) throw new Error("Falha ao reservar entrega do pagamento.");
  if (claim.state === "sent") return;
  if (claim.state !== "claimed") throw new Error(`Entrega pendente: ${claim.state}.`);

  const key = createHash("sha256").update(JSON.stringify([paymentId, productId])).digest("hex");
  const result = await resend.emails.send(claim.payload as EmailPayload, { idempotencyKey: `payment/${key}` });
  if (result.error || !result.data?.id) throw new Error("Provedor nao confirmou o envio do e-mail.");
  const { data: completed, error: updateError } = await supabase.from("payment_email_deliveries")
    .update({ sent_at: new Date().toISOString(), provider_email_id: result.data.id, email_payload: null })
    .eq("payment_id", paymentId).eq("product_id", productId).eq("claim_token", claim.token)
    .select("payment_id").single();
  if (updateError || !completed) throw new Error("Falha ao confirmar entrega do pagamento.");
}
