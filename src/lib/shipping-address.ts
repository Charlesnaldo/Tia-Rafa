// Shared by the checkout form, the payment route and the webhook: keep it free of server-only imports.

export type ShippingAddress = {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export const EMPTY_SHIPPING_ADDRESS: ShippingAddress = {
  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
};

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "";

// Returns a clean address, or an error message in Portuguese for the customer.
export function parseShippingAddress(value: unknown): { address: ShippingAddress } | { error: string } {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const address: ShippingAddress = {
    cep: text(raw.cep, 20).replace(/\D/g, ""),
    rua: text(raw.rua, 160),
    numero: text(raw.numero, 20),
    complemento: text(raw.complemento, 80) || undefined,
    bairro: text(raw.bairro, 80),
    cidade: text(raw.cidade, 80),
    uf: text(raw.uf, 2).toUpperCase(),
  };
  if (address.cep.length !== 8) return { error: "CEP invalido." };
  if (!address.rua) return { error: "Informe a rua do endereco de entrega." };
  if (!address.numero) return { error: "Informe o numero do endereco de entrega." };
  if (!address.bairro) return { error: "Informe o bairro do endereco de entrega." };
  if (!address.cidade) return { error: "Informe a cidade do endereco de entrega." };
  if (!UFS.has(address.uf)) return { error: "UF invalida." };
  return { address };
}

export function formatShippingAddress(address: ShippingAddress) {
  const cep = `${address.cep.slice(0, 5)}-${address.cep.slice(5)}`;
  const complemento = address.complemento ? ` - ${address.complemento}` : "";
  return `${address.rua}, ${address.numero}${complemento} - ${address.bairro}, ${address.cidade}/${address.uf} - CEP ${cep}`;
}
