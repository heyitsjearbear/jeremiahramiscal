// Format a Sanity `date` (YYYY-MM-DD) as the "2026-06" stamp used on /now.
// Sliced rather than parsed: a bare date string has no timezone, so building a
// Date from it would risk shifting the month backwards west of UTC.
export function formatMonth(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 7);
}

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
