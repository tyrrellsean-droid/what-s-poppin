import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Home } from "lucide-react";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  const bookingId = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!bookingId || !sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-booking-payment", {
          body: { sessionId, bookingId },
        });

        if (error) throw error;
        setVerified(data?.success || false);
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [bookingId, sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {verifying ? (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
            <h1 className="font-display text-2xl font-bold">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your booking.</p>
          </>
        ) : verified ? (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold">Booking Confirmed! 🔥</h1>
            <p className="text-muted-foreground">
              Your reservation has been confirmed. You'll receive a confirmation email shortly.
            </p>
            <Button onClick={() => navigate("/")} className="gradient-fire text-primary-foreground">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="font-display text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingSuccess;
