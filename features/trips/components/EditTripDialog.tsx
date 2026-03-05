"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus, Edit, Save } from "lucide-react";
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
import { editTripSchema, type EditTripFormData } from "../schemas/trip.schema";
import type { Trip } from "@/types";

interface EditTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  onSubmit: (data: EditTripFormData) => void;
}

export function EditTripDialog({
  open,
  onOpenChange,
  trip,
  onSubmit,
}: EditTripDialogProps) {
  const [friendName, setFriendName] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditTripFormData>({
    resolver: zodResolver(editTripSchema),
    defaultValues: {
      name: trip.name,
      friends: trip.friends,
    },
  });

  const friends = watch("friends");

  useEffect(() => {
    if (open) {
      reset({
        name: trip.name,
        friends: trip.friends,
      });
    }
  }, [open, trip, reset]);

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

  const handleFormSubmit = (data: EditTripFormData) => {
    onSubmit(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFriendName("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <Edit className="w-7 h-7 text-white" />
          </div>
          <DialogTitle className="text-2xl">Edit Trip</DialogTitle>
          <DialogDescription>
            Update trip name and manage friends
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {(errors.name || errors.friends) && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errors.name?.message || errors.friends?.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="editTripName">Trip Name</Label>
            <Input
              id="editTripName"
              {...register("name")}
              placeholder="Trip name"
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
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addFriend}
                className="border-primary/30 text-primary hover:bg-primary/10"
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
                  <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                    {f.charAt(0).toUpperCase()}
                  </span>
                  {f}
                  <button
                    type="button"
                    onClick={() => removeFriend(f)}
                    className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            variant="glow"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
