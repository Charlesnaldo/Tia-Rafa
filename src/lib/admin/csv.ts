// Excel-friendly CSV (semicolon, UTF-8 BOM) downloaded in the browser.
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    // Prefix formula-like cells so spreadsheets never execute them.
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const csv = [headers.join(";"), ...rows.map((row) => headers.map((key) => escape(row[key])).join(";"))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";
