import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import VenueCard from "./VenueCard";
import VenueDetailModal from "./VenueDetailModal";
import type { Tables, Database } from "@/integrations/supabase/types";
import type { LucideIcon } from "lucide-react";

type VenueCategory = Database["public"]["Enums"]["venue_category"];

type VenueWithStats = Tables<"venues"> & { avg_rating?: number; review_count?: number };

interface CategoryVenuesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    icon: LucideIcon;
    title: string;
    key: VenueCategory;
  } | null;
}

const CategoryVenuesModal = ({ open, onOpenChange, category }: CategoryVenuesModalProps) => {
  const [venues, setVenues] = useState<VenueWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Tables<"venues"> | null>(null);
  const [showVenueDetail, setShowVenueDetail] = useState(false);

  useEffect(() => {
    if (category && open) {
      fetchVenues();
    }
  }, [category, open]);

  const fetchVenues = async () => {
    if (!category) return;
    setLoading(true);

    const { data: venuesData, error } = await supabase
      .from("venues")
      .select("*")
      .eq("category", category.key)
      .order("name");

    if (!error && venuesData) {
      // Fetch review stats for each venue
      const venuesWithStats = await Promise.all(
        venuesData.map(async (venue) => {
          const { data: reviews } = await supabase
            .from("reviews")
            .select("rating")
            .eq("venue_id", venue.id);

          const reviewCount = reviews?.length || 0;
          const avgRating = reviewCount > 0
            ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

          return { ...venue, avg_rating: avgRating, review_count: reviewCount };
        })
      );

      setVenues(venuesWithStats);
    }

    setLoading(false);
  };

  const handleVenueClick = (venue: Tables<"venues">) => {
    setSelectedVenue(venue);
    setShowVenueDetail(true);
  };

  if (!category) return null;

  const IconComponent = category.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full gradient-fire">
                <IconComponent className="w-5 h-5 text-primary-foreground" />
              </div>
              <DialogTitle className="font-display text-xl">{category.title}</DialogTitle>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : venues.length > 0 ? (
            <div className="space-y-3 mt-4">
              {venues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onClick={() => handleVenueClick(venue)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No venues in this category yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <VenueDetailModal
        venue={selectedVenue}
        open={showVenueDetail}
        onOpenChange={setShowVenueDetail}
      />
    </>
  );
};

export default CategoryVenuesModal;
