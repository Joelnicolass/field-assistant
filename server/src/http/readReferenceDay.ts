const DATE = /^\d{4}-\d{2}-\d{2}$/;

function serverToday(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Lee X-Reference-Day; si falta o está mal formado, usa la fecha del server. */
export function readReferenceDay(header: string | undefined): string {
  return header !== undefined && DATE.test(header) ? header : serverToday();
}
