/* eslint-disable @typescript-eslint/no-require-imports */
const { loadEnvConfig } = require("@next/env");
const { Resend } = require("resend");

loadEnvConfig(process.cwd());

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEST_EMAIL_TO;
  const from = process.env.RESEND_FROM || "Tia Rafa <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY nao configurada.");
    process.exit(1);
  }

  if (!to) {
    console.error("TEST_EMAIL_TO nao configurado.");
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Teste de envio - Tia Rafa",
    html: `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2>Teste de e-mail com Resend</h2>
        <p>Se voce recebeu esta mensagem, o envio de e-mail esta funcionando.</p>
        <p><strong>Data:</strong> ${new Date().toISOString()}</p>
      </div>
    `,
    text: `Teste de e-mail com Resend. Data: ${new Date().toISOString()}`,
  });

  if (error) {
    console.error("Falha ao enviar e-mail de teste:", error);
    process.exit(1);
  }

  console.log("E-mail de teste enviado com sucesso. ID:", data?.id);
}

main().catch((error) => {
  console.error("Erro inesperado no teste de e-mail:", error);
  process.exit(1);
});
