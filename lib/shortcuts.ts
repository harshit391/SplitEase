export interface ShortcutDefinition {
  key: string;
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  label: string;
  description: string;
  context: "global" | "home" | "trip";
}

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  // Global
  { key: "?", shift: true, label: "?", description: "Open keyboard shortcuts", context: "global" },

  // Home page
  { key: "n", label: "N", description: "Create new trip", context: "home" },
  { key: "i", label: "I", description: "Import trip from file", context: "home" },

  // Trip detail page
  { key: "e", label: "E", description: "Add expense group", context: "trip" },
  { key: "s", label: "S", description: "Share trip", context: "trip" },
  { key: "d", label: "D", description: "Download / export trip", context: "trip" },
  { key: "t", label: "T", description: "Edit trip details", context: "trip" },
];

export const CONTEXT_LABELS: Record<string, string> = {
  global: "Global",
  home: "Home Page",
  trip: "Trip Detail",
};

export const CONTEXT_DESCRIPTIONS: Record<string, string> = {
  global: "Available on every page",
  home: "Available on the home page",
  trip: "Available on the trip detail page",
};
