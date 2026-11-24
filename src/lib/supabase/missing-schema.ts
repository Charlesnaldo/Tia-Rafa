type DbError = { code?: string; message?: string } | null | undefined;

// True when a query failed only because the 2026-11-23 migration has not been run yet.
// Callers treat that as "feature off" so the store keeps working before the migration.
export function isMissingSchema(error: DbError) {
  if (!error) return false;
  if (["42P01", "42703", "42883", "PGRST200", "PGRST202", "PGRST204", "PGRST205"].includes(error.code || "")) return true;
  return /does not exist|could not find the (table|column|function)/i.test(error.message || "");
}
