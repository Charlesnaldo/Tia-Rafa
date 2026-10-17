export class RequestBodyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RequestBodyError("Envie um corpo JSON.", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("Corpo ausente.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError("Mensagem excede o tamanho permitido.", 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    try { return JSON.parse(new TextDecoder().decode(bytes)); }
    catch { throw new RequestBodyError("JSON invalido.", 400); }
  } finally {
    reader.releaseLock();
  }
}
