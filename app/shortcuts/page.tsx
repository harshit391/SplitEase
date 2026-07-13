"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Keyboard } from "lucide-react";
import {
  SHORTCUT_DEFINITIONS,
  CONTEXT_LABELS,
  CONTEXT_DESCRIPTIONS,
} from "@/lib/shortcuts";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";

export default function ShortcutsPage() {
  const grouped = SHORTCUT_DEFINITIONS.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.context]) acc[shortcut.context] = [];
      acc[shortcut.context].push(shortcut);
      return acc;
    },
    {} as Record<string, typeof SHORTCUT_DEFINITIONS>
  );

  const contextOrder = ["global", "home", "trip"] as const;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[180px] -top-[160px] h-[430px] w-[430px] rounded-full bg-sky-300/30 dark:bg-[#0A84FF]/15 blur-3xl" />
        <div className="absolute -right-[130px] top-[80px] h-[480px] w-[480px] rounded-full bg-emerald-300/25 dark:bg-[#30D158]/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Split Solve"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl"
            />
            <span className="font-extrabold text-foreground text-lg tracking-tight">
              Split Solve
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Page title */}
          <motion.div variants={fadeInUp} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <Keyboard className="w-6 h-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">
                Keyboard Shortcuts
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Navigate faster with these keyboard shortcuts. They are disabled
              while typing in inputs or when a dialog is open.
            </p>
          </motion.div>

          {/* Shortcut groups */}
          <div className="grid gap-6">
            {contextOrder.map((context) => {
              const shortcuts = grouped[context];
              if (!shortcuts) return null;

              return (
                <motion.div
                  key={context}
                  variants={staggerItem}
                  className="rounded-2xl bg-card p-6"
                  style={{ border: "1.5px solid #c4c4c8" }}
                >
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-foreground">
                      {CONTEXT_LABELS[context]}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {CONTEXT_DESCRIPTIONS[context]}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.key + shortcut.context}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-foreground">
                          {shortcut.description}
                        </span>
                        <kbd
                          className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-lg bg-background text-xs font-mono font-medium text-foreground"
                          style={{ border: "1.5px solid #c4c4c8" }}
                        >
                          {shortcut.label}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer note */}
          <motion.p
            variants={staggerItem}
            className="mt-8 text-xs text-muted-foreground text-center"
          >
            <kbd
              className="inline-flex items-center justify-center min-w-[2rem] h-6 px-1.5 rounded-md bg-background text-[11px] font-mono font-medium text-muted-foreground mr-1.5"
              style={{ border: "1.5px solid #c4c4c8" }}
            >
              Esc
            </kbd>
            closes any open dialog (built-in)
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
