export function isDateInput(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function createdAtBounds(from?: string, to?: string) {
  const start = isDateInput(from) ? `${from}T00:00:00+04:00` : undefined;
  const end = isDateInput(to) ? `${to}T23:59:59.999+04:00` : undefined;
  return { start, end };
}
