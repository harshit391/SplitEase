"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Receipt,
  Sparkles,
  MapPin,
  Upload,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard, CreateTripDialog } from "@/features/trips/components";
import {
  useTrips,
  useCreateTrip,
  useDeleteTrip,
  useImportTrip,
} from "@/features/trips/hooks/useTrips";
import { useUIStore } from "@/store";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { createSavedTripsRepository } from "@/database/supabase.repository";
import type { Trip } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { UserMenu } from "@/components/user-menu";
import { SyncStatusBadge } from "@/components/sync-status-badge";

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: trips = [], isLoading } = useTrips();
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();
  const importTrip = useImportTrip();

  const { user } = useAuth();
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);

  const { createTripDialogOpen, openCreateTripDialog, closeCreateTripDialog } =
    useUIStore();

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const savedRepo = createSavedTripsRepository(supabase, user.id);
    savedRepo.getSavedTrips().then(setSavedTrips);
  }, [user]);

  const handleCreateTrip = async (data: { name: string; friends: string[] }) => {
    const newTrip = await createTrip.mutateAsync(data);
    closeCreateTripDialog();
    router.push(`/${newTrip.id}`);
  };

  const handleDeleteTrip = (id: string) => {
    deleteTrip.mutate(id);
  };

  const handleImportTrip = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonString = event.target?.result;
      if (typeof jsonString === "string") {
        try {
          const tripData = JSON.parse(jsonString) as Trip;
          const importedTrip = await importTrip.mutateAsync(tripData);
          alert(`Trip "${importedTrip.name}" imported successfully!`);
          router.push(`/${importedTrip.id}`);
        } catch {
          alert("Failed to import trip. Please check the file format.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SplitEase"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-semibold text-foreground text-lg">SplitEase</span>
          </div>
          <div className="flex items-center gap-2">
            <SyncStatusBadge />
            <Button
              onClick={openCreateTripDialog}
              size="sm"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section with Glow */}
      <div className="relative hero-glow pt-16">
        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-secondary-foreground mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Bill Splitting Made Easy
            </motion.div>

            {/* Hero Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]"
            >
              Split bills,{" "}
              <span className="gradient-text italic">not friendships</span>
            </motion.h1>

            {/* Hero Subtext */}
            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Track shared expenses, split bills fairly, and settle up with
              friends — all stored locally on your device.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                onClick={openCreateTripDialog}
                size="lg"
                variant="glow"
              >
                <Plus className="w-5 h-5" />
                Create New Trip
              </Button>
              <Button
                onClick={handleImportTrip}
                size="lg"
                variant="outline"
              >
                <Upload className="w-5 h-5" />
                Import Trip
              </Button>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </motion.div>
      </div>

      {/* Trips Grid Section */}
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-card border border-white/5 flex items-center justify-center">
              <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              No trips yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Create your first trip to start tracking expenses with friends.
            </p>
            <Button onClick={openCreateTripDialog} variant="glow">
              <Plus className="w-5 h-5" />
              Create Trip
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                Your Trips
              </h2>
              <span className="text-sm font-medium text-muted-foreground px-4 py-2 rounded-full border border-white/5 bg-card">
                {trips.length} {trips.length === 1 ? "trip" : "trips"}
              </span>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Saved Trips Section */}
      {savedTrips.length > 0 && (
        <div className="relative max-w-6xl mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-amber-400" />
              </div>
              Saved Trips
            </h2>
            <span className="text-sm font-medium text-muted-foreground px-4 py-2 rounded-full border border-white/5 bg-card">
              {savedTrips.length} saved
            </span>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {savedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={() => {}}
                linkPrefix="/shared"
                savedView
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built with care. All data stored locally on your device.
          </p>
        </div>
      </footer>

      <CreateTripDialog
        open={createTripDialogOpen}
        onOpenChange={(open) =>
          open ? openCreateTripDialog() : closeCreateTripDialog()
        }
        onSubmit={handleCreateTrip}
      />
    </div>
  );
}
