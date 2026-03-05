export function generateTripId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug}-${Date.now().toString(36)}`;
}

export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}
