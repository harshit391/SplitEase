"use client";

import { useEffect, useCallback, useMemo } from "react";

export interface Shortcut {
  key: string;
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  label: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const stableShortcuts = useMemo(() => shortcuts, [JSON.stringify(shortcuts.map(s => ({ key: s.key, shift: s.shift, ctrl: s.ctrl, alt: s.alt })))]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (document.querySelector('[data-slot="dialog-content"]')) {
        return;
      }

      for (const shortcut of stableShortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !(event.ctrlKey || event.metaKey);
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && shiftMatch && ctrlMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [stableShortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
