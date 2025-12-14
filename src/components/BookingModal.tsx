import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Users, Loader2, CreditCard } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface BookingModalProps {
  venue: Tables<"venues"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Base booking fee in cents ($25.00)
const BASE_BOOKING_FEE = 2500;

const BookingModal = ({ venue, open, onOpenChange }: BookingModalProps) => {
  const { user } = useAuth();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    if (!venue) return;

    if (!bookingDate || !bookingTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your booking.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-booking-payment", {
        body: {
          venueId: venue.id,
          venueName: venue.name,
          bookingDate,
          bookingTime,
          partySize,
          amountCents: BASE_BOOKING_FEE,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, "_blank");
        onOpenChange(false);
        toast({
          title: "Redirecting to payment",
          description: "Complete your payment in the new tab.",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!venue) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Book {venue.name}</DialogTitle>
          <DialogDescription>
            Reserve your spot and pay securely with Stripe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label htmlFor="partySize" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Party Size
            </Label>
            <Input
              id="partySize"
              type="number"
              min={1}
              max={20}
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
              className="bg-background border-border"
            />
          </div>

          {/* Price Display */}
          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Booking Fee</span>
              <span className="font-display font-bold text-lg text-primary">
                ${(BASE_BOOKING_FEE / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {!user && (
            <p className="text-sm text-destructive text-center">
              Please sign in to make a booking.
            </p>
          )}
        </div>

        <Button
          onClick={handleBooking}
          disabled={loading || !user || !bookingDate || !bookingTime}
          className="w-full gradient-fire text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay & Book 🔥
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
