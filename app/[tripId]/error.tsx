"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TripError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Trip page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md space-y-4">
        <h2 className="text-xl font-bold text-foreground">Failed to load trip</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong while loading this trip. It may have been deleted or you may not have access.
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
