import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wine, Laugh, UtensilsCrossed, Home, Music, Calendar, Compass, Sparkles, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import FireButton from "./FireButton";
import CategoryCard from "./CategoryCard";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import SubmitHiddenGemModal from "./SubmitHiddenGemModal";
import CategoryVenuesModal from "./CategoryVenuesModal";
import type { Database } from "@/integrations/supabase/types";
import type { LucideIcon } from "lucide-react";

type VenueCategory = Database["public"]["Enums"]["venue_category"];

interface Category {
  icon: LucideIcon;
  title: string;
  description: string;
  key: VenueCategory | "trending";
}

const categories: Category[] = [
  {
    icon: Wine,
    title: "Bars & Nightlife",
    description: "Hottest spots in town",
    key: "bars_nightlife",
  },
  {
    icon: Laugh,
    title: "Comedy",
    description: "Stand-up & improv shows",
    key: "comedy",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Dining",
    description: "Local favorites & more",
    key: "food_dining",
  },
  {
    icon: Home,
    title: "Places to Stay",
    description: "Airbnb & hotels",
    key: "places_to_stay",
  },
  {
    icon: Music,
    title: "Live Music",
    description: "Concerts & gigs",
    key: "live_music",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "What's happening now",
    key: "events",
  },
  {
    icon: Compass,
    title: "Off the Beaten Path",
    description: "Hidden gems & secrets",
    key: "hidden_gems",
  },
  {
    icon: Sparkles,
    title: "Trending Now",
    description: "What's hot right now",
    key: "trending",
  },
];

const WhatsPoppin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGemModal, setShowGemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    icon: LucideIcon;
    title: string;
    key: VenueCategory;
  } | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    if (category.key === "trending") {
      toast({
        title: `🔥 ${category.title}`,
        description: "Coming soon! Stay tuned for the hottest spots.",
      });
      return;
    }

    if (category.key === "hidden_gems" && !user) {
      toast({
        title: "Sign in to share",
        description: "Create an account to submit hidden gems.",
      });
      navigate("/auth");
      return;
    }

    // Open category modal to browse venues
    setSelectedCategory({
      icon: category.icon,
      title: category.title,
      key: category.key as VenueCategory,
    });
    setShowCategoryModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fire-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fire-red/10 rounded-full blur-3xl" />
      </div>

      {/* Auth button */}
      <div className="fixed top-4 right-4 z-50">
        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-border bg-card/50 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/auth")}
            className="border-border bg-card/50 backdrop-blur-sm"
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      {/* Header */}
      <div className={cn(
        "text-center mb-12 transition-all duration-500",
        isOpen ? "opacity-50 scale-95" : "opacity-100 scale-100"
      )}>
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
          <span className="gradient-fire-text">What's Poppin</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          Discover the hottest spots around you
        </p>
      </div>

      {/* Main fire button */}
      <div className="relative z-20 mb-12">
        <FireButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        
        {/* Tap hint */}
        {!isOpen && (
          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-sm whitespace-nowrap animate-pulse">
            Tap to explore
          </p>
        )}
      </div>

      {/* Categories grid */}
      <div className={cn(
        "w-full max-w-4xl transition-all duration-500 ease-out",
        isOpen 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-8 pointer-events-none"
      )}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.title}
              icon={category.icon}
              title={category.title}
              description={category.description}
              delay={index * 80}
              isVisible={isOpen}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
      </div>

      {/* Close hint when open */}
      {isOpen && (
        <p className="mt-8 text-muted-foreground text-sm animate-fade-up">
          Tap the flame to close
        </p>
      )}

      {/* Hidden Gem Submission Modal */}
      <SubmitHiddenGemModal open={showGemModal} onOpenChange={setShowGemModal} />

      {/* Category Venues Modal */}
      <CategoryVenuesModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        category={selectedCategory}
      />
    </div>
  );
};

export default WhatsPoppin;
