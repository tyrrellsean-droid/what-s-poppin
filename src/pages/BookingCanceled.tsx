import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { XCircle, Home, RotateCcw } from "lucide-react";

const BookingCanceled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("booking_id");

  useEffect(() => {
    const cancelBooking = async () => {
      if (!bookingId) return;

      try {
        await supabase.functions.invoke("cancel-booking", {
          body: { bookingId },
        });
      } catch (error) {
        console.error("Cancel booking error:", error);
      }
    };

    cancelBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold">Booking Canceled</h1>
        <p className="text-muted-foreground">
          Your booking has been canceled. No charges were made to your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => navigate("/")} className="gradient-fire text-primary-foreground">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingCanceled;
