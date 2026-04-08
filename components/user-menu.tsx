"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
        <User className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-muted-foreground max-w-[120px] truncate">
          {displayName}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleSignOut}
        title="Sign out"
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
