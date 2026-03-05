"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, UserPlus, Rocket } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  createTripSchema,
  type CreateTripFormData,
} from "../schemas/trip.schema";

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTripFormData) => void;
}

export function CreateTripDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateTripDialogProps) {
  const [friendName, setFriendName] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: "",
      friends: [],
    },
  });

  const friends = watch("friends");

  const addFriend = () => {
    const name = friendName.trim();
    if (!name) return;
    if (friends.includes(name)) return;
    setValue("friends", [...friends, name]);
    setFriendName("");
  };

  const removeFriend = (name: string) => {
    setValue(
      "friends",
      friends.filter((f) => f !== name)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFriend();
    }
  };

  const handleFormSubmit = (data: CreateTripFormData) => {
    onSubmit(data);
    reset();
    setFriendName("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setFriendName("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
            <Rocket className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Create New Trip</DialogTitle>
          <DialogDescription>
            Set up your trip and add friends to split expenses with
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {(errors.name || errors.friends) && (
            <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {errors.name?.message || errors.friends?.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              id="tripName"
              {...register("name")}
              placeholder="e.g., Goa Weekend Trip"
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Add Friends</Label>
            <div className="flex gap-2">
              <Input
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Friend's name"
                className="flex-1 bg-background/50"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addFriend}
                className="border-primary/30 text-primary hover:bg-primary/20"
              >
                <UserPlus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {friends.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {friends.map((f) => (
                <Badge
                  key={f}
                  variant="secondary"
                  className="inline-flex items-center gap-2 px-3 py-2"
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-cyan-500/30 flex items-center justify-center text-xs font-bold text-primary">
                    {f.charAt(0).toUpperCase()}
                  </span>
                  {f}
                  <button
                    type="button"
                    onClick={() => removeFriend(f)}
                    className="p-0.5 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground font-bold"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Trip
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
