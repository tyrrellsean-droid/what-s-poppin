import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import FireRating from "./FireRating";
import type { Tables } from "@/integrations/supabase/types";

interface VenueCardProps {
  venue: Tables<"venues"> & { avg_rating?: number; review_count?: number };
  onClick: () => void;
}

const VenueCard = ({ venue, onClick }: VenueCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl",
        "gradient-card border border-border",
        "hover:border-primary/50 hover:shadow-fire-sm",
        "transition-all duration-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate">
            {venue.name}
          </h3>
          {venue.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{venue.address}</span>
            </p>
          )}
          {venue.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {venue.description}
            </p>
          )}
        </div>
        {venue.is_hidden_gem && (
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary flex-shrink-0">
            Hidden Gem
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <FireRating rating={venue.avg_rating || 0} readonly size="sm" />
        <span className="text-xs text-muted-foreground">
          {venue.review_count || 0} {venue.review_count === 1 ? "review" : "reviews"}
        </span>
      </div>
    </button>
  );
};

export default VenueCard;
