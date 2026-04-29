import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

function getWebhookUrl() {
  const url = process.env.N8N_EVOLUTION_WEBHOOK_URL?.trim() || "https://n8n.smartrm.com.br/webhook/chat-site";
  if (!url) {
    throw new Error("N8N_EVOLUTION_WEBHOOK_URL nao configurado.");
  }
  return url;
}

function getEvolutionInstanceId() {
  return process.env.EVOLUTION_INSTANCE_ID?.trim() || "tiarafa";
}

function extractAssistantText(data: unknown) {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "Mensagem enviada com sucesso.";

  const candidates = ["reply", "message", "text", "output", "response"];
  for (const key of candidates) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "Mensagem enviada com sucesso.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    const page = typeof body?.page === "string" ? body.page.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });
    }

    const payload = {
      text,
      sessionId,
      page,
      instanceId: getEvolutionInstanceId(),
      source: "site-chat",
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(getWebhookUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    let data: unknown = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao encaminhar mensagem.", details: data },
        { status: 502 }
      );
    }

    const assistantText = extractAssistantText(data);

    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: assistantText,
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      ok: true,
      messages,
      raw: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
