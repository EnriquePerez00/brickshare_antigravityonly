import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string;
  theme: string;
  ageRange: string;
  pieceCount: number;
  skillBoost: string;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: string) => void;
}

const ProductCard = ({
  id,
  name,
  imageUrl,
  theme,
  ageRange,
  pieceCount,
  skillBoost,
  isWishlisted = false,
  onWishlistToggle
}: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-secondary/50 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={() => onWishlistToggle?.(id)}
          className={cn(
            "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isWishlisted 
              ? "bg-destructive text-primary-foreground shadow-lg" 
              : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-background hover:text-destructive"
          )}
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
        </button>

        {/* Theme Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground">
            {theme}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
            {ageRange}
          </span>
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent">
            {pieceCount} piezas
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Desarrolla:</span> {skillBoost}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
