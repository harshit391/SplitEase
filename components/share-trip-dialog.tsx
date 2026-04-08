"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Share2,
  Plus,
  Trash2,
  Link,
  Copy,
  Check,
  Globe,
  Lock,
  Loader2,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createShareRepository } from "@/database/supabase.repository";
import type { DbTripShare } from "@/types";

interface ShareTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripName: string;
}

export function ShareTripDialog({
  open,
  onOpenChange,
  tripId,
  tripName,
}: ShareTripDialogProps) {
  const [shares, setShares] = useState<DbTripShare[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();
  const shareRepo = createShareRepository(supabase);

  const privateShares = shares.filter((s) => s.share_type === "private");
  const publicShare = shares.find((s) => s.share_type === "public");

  const loadShares = useCallback(async () => {
    setLoading(true);
    const data = await shareRepo.getShares(tripId);
    setShares(data);
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open, loadShares]);

  const handleAddEmail = async () => {
    if (!email.trim()) return;
    setAddingEmail(true);
    await shareRepo.addPrivateShare(tripId, email.trim().toLowerCase());
    setEmail("");
    await loadShares();
    setAddingEmail(false);
  };

  const handleRemoveShare = async (shareId: string) => {
    await shareRepo.removeShare(shareId);
    await loadShares();
  };

  const handleTogglePublic = async () => {
    if (publicShare) {
      await shareRepo.disablePublicShare(tripId);
    } else {
      await shareRepo.enablePublicShare(tripId);
    }
    await loadShares();
  };

  const handleCopyLink = async () => {
    if (!publicShare?.share_code) return;
    const link = `${window.location.origin}/shared/${publicShare.share_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <DialogTitle>Share Trip</DialogTitle>
          <DialogDescription>
            Share &quot;{tripName}&quot; with others (view-only access)
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Private Share Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lock className="w-4 h-4 text-primary" />
                Share with Google account
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAddEmail}
                  disabled={!email.trim() || addingEmail}
                  className="shrink-0"
                >
                  {addingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {privateShares.length > 0 && (
                <div className="space-y-2">
                  {privateShares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {share.shared_with_email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveShare(share.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Public Share Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Public link
                </Label>
                <Button
                  variant={publicShare ? "default" : "outline"}
                  size="xs"
                  onClick={handleTogglePublic}
                  className={
                    publicShare
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                      : ""
                  }
                >
                  {publicShare ? "Enabled" : "Enable"}
                </Button>
              </div>

              {publicShare && (
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/shared/${publicShare.share_code}`}
                    className="text-xs bg-white/5"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">
                {publicShare
                  ? "Anyone with this link and a Google account can view this trip."
                  : "Generate a link that anyone with a Google account can use to view this trip."}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
