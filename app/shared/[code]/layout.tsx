import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type Props = {
  params: Promise<{ code: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Look up the share code to get the trip name
  const { data: share } = await supabase
    .from("trip_shares")
    .select("trip_id")
    .eq("share_code", code)
    .eq("share_type", "public")
    .maybeSingle();

  if (!share) {
    return {
      title: "Shared Trip | Split Solve",
      description: "View shared trip expenses on Split Solve.",
    };
  }

  const { data: trip } = await supabase
    .from("trips")
    .select("name, friends")
    .eq("id", share.trip_id)
    .single();

  if (!trip) {
    return {
      title: "Shared Trip | Split Solve",
      description: "View shared trip expenses on Split Solve.",
    };
  }

  const friendCount = trip.friends?.length ?? 0;
  const description = `View expenses for ${trip.name}${friendCount > 0 ? ` with ${friendCount} people` : ""} on Split Solve.`;

  return {
    title: `${trip.name} | Split Solve`,
    description,
    openGraph: {
      title: `${trip.name} | Split Solve`,
      description,
      siteName: "Split Solve",
      images: ["/og-image.png"],
      type: "website",
    },
  };
}

export default function SharedTripLayout({ children }: Props) {
  return children;
}
