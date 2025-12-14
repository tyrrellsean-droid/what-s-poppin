import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface FireButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const FireButton = ({ isOpen, onClick }: FireButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group flex items-center justify-center",
        "w-24 h-24 rounded-full",
        "gradient-fire shadow-fire",
        "transition-all duration-500 ease-out",
        "hover:scale-110 active:scale-95",
        isOpen && "scale-90 rotate-180"
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full gradient-fire opacity-50 blur-xl group-hover:blur-2xl transition-all duration-300" />
      
      {/* Inner circle */}
      <div className="absolute inset-2 rounded-full bg-background/20 backdrop-blur-sm" />
      
      {/* Icon */}
      <Flame 
        className={cn(
          "relative z-10 w-12 h-12 text-primary-foreground",
          "transition-transform duration-500",
          !isOpen && "animate-pulse-fire",
          isOpen && "rotate-180"
        )} 
        strokeWidth={2.5}
      />

      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-full border-2 border-fire-orange/30 animate-ping" style={{ animationDuration: '2s' }} />
    </button>
  );
};

export default FireButton;
