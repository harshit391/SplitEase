"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "shortcut-hint-seen";

export function KeyboardShortcutHint() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = !window.matchMedia("(pointer: fine)").matches;
    if (isTouchDevice) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const navigate = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    router.push("/shortcuts");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl bg-card px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
          style={{ border: "1.5px solid #c4c4c8" }}
          onClick={navigate}
        >
          <kbd
            className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-background text-xs font-mono font-medium text-foreground"
            style={{ border: "1.5px solid #c4c4c8" }}
          >
            ?
          </kbd>
          <span className="text-xs text-muted-foreground">View shortcuts</span>
          <button
            onClick={dismiss}
            className="ml-1 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss shortcut hint"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
