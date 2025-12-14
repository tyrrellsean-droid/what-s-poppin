import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Loader2 } from "lucide-react";
import FireRating from "./FireRating";
import type { Tables } from "@/integrations/supabase/types";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

interface VenueDetailModalProps {
  venue: Tables<"venues"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VenueDetailModal = ({ venue, open, onOpenChange }: VenueDetailModalProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (venue && open) {
      fetchReviews();
    }
  }, [venue, open]);

  const fetchReviews = async () => {
    if (!venue) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
      
      // Check if current user has a review
      if (user) {
        const userReview = data.find((r) => r.user_id === user.id);
        if (userReview) {
          setExistingReview(userReview);
          setMyRating(userReview.rating);
          setMyComment(userReview.comment || "");
        } else {
          setExistingReview(null);
          setMyRating(0);
          setMyComment("");
        }
      }
    }

    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user || !venue) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (myRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a fire rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from("reviews")
        .update({
          rating: myRating,
          comment: myComment.trim() || null,
        })
        .eq("id", existingReview.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update review.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Review updated! 🔥" });
        fetchReviews();
      }
    } else {
      // Create new review
      const { error } = await supabase.from("reviews").insert({
        venue_id: venue.id,
        user_id: user.id,
        rating: myRating,
        comment: myComment.trim() || null,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit review.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Review submitted! 🔥" });
        fetchReviews();
      }
    }

    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{venue.name}</DialogTitle>
          {venue.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {venue.address}
            </p>
          )}
        </DialogHeader>

        {/* Average Rating */}
        <div className="flex items-center gap-3 py-3 border-b border-border">
          <FireRating rating={Math.round(avgRating)} readonly size="md" />
          <span className="text-sm text-muted-foreground">
            {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>

        {venue.description && (
          <p className="text-muted-foreground">{venue.description}</p>
        )}

        {/* Your Review Section */}
        {user && (
          <div className="space-y-3 py-4 border-t border-border">
            <h4 className="font-display font-semibold">
              {existingReview ? "Update Your Review" : "Leave a Review"}
            </h4>
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <FireRating rating={myRating} onRatingChange={setMyRating} size="lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                placeholder="What did you think of this place?"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || myRating === 0}
              className="w-full gradient-fire text-primary-foreground"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : existingReview ? (
                "Update Review"
              ) : (
                "Submit Review 🔥"
              )}
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-display font-semibold">Reviews</h4>
            {reviews.map((review) => (
              <div key={review.id} className="p-3 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <FireRating rating={review.rating} readonly size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No reviews yet. Be the first!
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VenueDetailModal;
