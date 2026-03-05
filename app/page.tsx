"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Receipt,
  Sparkles,
  MapPin,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { TripCard, CreateTripDialog } from "@/features/trips/components";
import {
  useTrips,
  useCreateTrip,
  useDeleteTrip,
  useImportTrip,
} from "@/features/trips/hooks/useTrips";
import { useUIStore } from "@/store";
import type { Trip } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: trips = [], isLoading } = useTrips();
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();
  const importTrip = useImportTrip();

  const { createTripDialogOpen, openCreateTripDialog, closeCreateTripDialog } =
    useUIStore();

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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SplitEase"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-bold text-foreground">SplitEase</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative border-b border-border">
        {/* Background gradient for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/5" />

        <motion.div
          className="relative max-w-5xl mx-auto px-6 pt-16 pb-16"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <div className="text-center">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Bill Splitting Made Easy
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight"
            >
              Split bills,{" "}
              <span className="text-primary">not friendships</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Track shared expenses, split bills fairly, and settle up with
              friends — all stored locally on your device.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                onClick={openCreateTripDialog}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-soft dark:glow-primary transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Trip
              </Button>
              <Button
                onClick={handleImportTrip}
                size="lg"
                variant="outline"
                className="border-border hover:border-primary/30 hover:bg-accent font-semibold px-6 py-3 rounded-lg transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
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

      {/* Trips Grid */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-card rounded-2xl flex items-center justify-center border border-border">
              <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No trips yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first trip to get started!
            </p>
            <Button
              onClick={openCreateTripDialog}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Trip
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                Your Trips
              </h2>
              <span className="text-sm font-medium text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
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
