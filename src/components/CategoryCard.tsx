import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  isVisible: boolean;
  onClick: () => void;
}

const CategoryCard = ({ icon: Icon, title, description, delay, isVisible, onClick }: CategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-3 p-6",
        "rounded-2xl gradient-card border border-border/50",
        "shadow-card hover:shadow-fire-sm",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:border-primary/30",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "opacity-0",
        isVisible && "animate-fade-up opacity-100"
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Icon container */}
      <div className={cn(
        "flex items-center justify-center w-14 h-14",
        "rounded-xl gradient-fire",
        "group-hover:shadow-fire-sm transition-all duration-300"
      )}>
        <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2} />
      </div>

      {/* Text content */}
      <div className="text-center">
        <h3 className="font-display font-semibold text-foreground text-lg mb-1">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

export default CategoryCard;
