import { useState } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface FireRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const FireRating = ({ rating, onRatingChange, readonly = false, size = "md" }: FireRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(value)}
          onMouseEnter={() => !readonly && setHoverRating(value)}
          onMouseLeave={() => setHoverRating(0)}
          className={cn(
            "transition-all duration-200",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Flame
            className={cn(
              sizeClasses[size],
              "transition-colors duration-200",
              value <= displayRating
                ? "text-primary fill-primary"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default FireRating;
