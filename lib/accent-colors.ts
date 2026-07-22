export const ACCENT_COLORS = [
  "#FF9500", // Orange
  "#2563EB", // Blue
  "#34C759", // Green
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#0D9488", // Teal
  "#DC2626", // Red
  "#D97706", // Amber
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
];

export function getRandomAccentColor(): string {
  return ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
}
