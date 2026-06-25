// Format an ISO datetime as e.g. "June 12, 2026". UTC-anchored so the date
// never shifts a day depending on the server's timezone.
export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
