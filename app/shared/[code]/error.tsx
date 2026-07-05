"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SharedTripError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Shared trip error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md space-y-4">
        <h2 className="text-xl font-bold text-foreground">Failed to load shared trip</h2>
        <p className="text-sm text-muted-foreground">
          This share link may be invalid or the trip is no longer available.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="glow">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
