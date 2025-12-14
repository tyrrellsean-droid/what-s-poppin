import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Compass, MapPin, Loader2 } from "lucide-react";
import { z } from "zod";

const gemSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  address: z.string().trim().min(5, "Please provide a valid address").max(200, "Address too long"),
});

interface SubmitHiddenGemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubmitHiddenGemModal = ({ open, onOpenChange }: SubmitHiddenGemModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({ title: "Location captured! 📍" });
        setGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Could not get your location. Please enter coordinates manually.",
          variant: "destructive",
        });
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a hidden gem.",
        variant: "destructive",
      });
      return;
    }

    const validation = gemSchema.safeParse({ name, description, address });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!coords) {
      toast({
        title: "Location required",
        description: "Please capture your current location.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("venues").insert({
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      latitude: coords.lat,
      longitude: coords.lng,
      category: "hidden_gems",
      is_hidden_gem: true,
      submitted_by: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Hidden gem submitted! 🔥",
        description: "Thanks for sharing your discovery!",
      });
      setName("");
      setDescription("");
      setAddress("");
      setCoords(null);
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full gradient-fire">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">Share a Hidden Gem</DialogTitle>
              <DialogDescription>
                Found somewhere special? Let others discover it!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="gem-name">Place Name</Label>
            <Input
              id="gem-name"
              placeholder="The Secret Garden Cafe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gem-description">What makes it special?</Label>
            <Textarea
              id="gem-description"
              placeholder="This hidden courtyard cafe serves the best espresso in town..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="bg-background border-border min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gem-address">Address</Label>
            <Input
              id="gem-address"
              placeholder="123 Hidden Lane, Secret District"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full border-border"
            >
              {gettingLocation ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              {coords ? `📍 Location captured` : "Capture Current Location"}
            </Button>
            {coords && (
              <p className="text-xs text-muted-foreground">
                Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gradient-fire text-primary-foreground font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Hidden Gem 🔥"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitHiddenGemModal;
