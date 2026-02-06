import { motion } from "framer-motion";
import { Heart, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductRowProps {
  id: string;
  name: string;
  imageUrl: string;
  theme: string;
  ageRange: string;
  pieceCount: number;
  skillBoost: string;
  legoRef?: string;
  description?: string | null;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: string) => Promise<boolean> | void;
}

export const ProductRow = ({
  id,
  name,
  imageUrl,
  theme,
  ageRange,
  pieceCount,
  skillBoost,
  legoRef,
  description,
  isWishlisted = false,
  onWishlistToggle,
}: ProductRowProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (onWishlistToggle) {
      setIsToggling(true);
      await onWishlistToggle(id);
      setIsToggling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all flex h-24 sm:h-28" // Fixed height for consistency
    >
      {/* Image Section - Fixed Width */}
      <div className="w-24 sm:w-32 bg-secondary/10 shrink-0 p-2 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 p-3 flex flex-col justify-center min-w-0"> {/* min-w-0 prevents flex child from overflowing */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                {theme}
              </span>
              {legoRef && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  #{legoRef}
                </span>
              )}
            </div>
            <h3 className="font-display text-sm sm:text-base font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
              {name}
            </h3>
          </div>
          
          {/* Mobile Heart (visible only on small screens if space is tight, otherwise keep right) */}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {ageRange}
            </span>
            <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {pieceCount} pzs.
            </span>
        </div>
      </div>

      {/* Actions Section - Right Aligned */}
      <div className="flex items-center px-4 gap-2 border-l border-border/50 bg-muted/5">
         <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase text-[10px] tracking-widest">
                    {theme}
                  </Badge>
                  {legoRef && <span className="text-xs font-mono text-muted-foreground">REF: {legoRef}</span>}
                </div>
                <DialogTitle className="text-2xl font-display font-bold leading-tight">{name}</DialogTitle>
                <DialogDescription className="pt-4 text-sm leading-relaxed text-foreground/80">
                  {description || "Este set de LEGO promete horas de diversión y creatividad."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Edad</p>
                    <p className="text-lg font-bold text-foreground">{ageRange}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Piezas</p>
                    <p className="text-lg font-bold text-foreground">{pieceCount}</p>
                </div>
                 {skillBoost && (
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Habilidades</p>
                    <p className="text-sm font-medium text-foreground">{skillBoost}</p>
                  </div>
                )}
              </div>
               <div className="mt-6">
                <Button className="w-full gradient-hero rounded-xl h-12" onClick={handleWishlistClick}>
                  {isWishlisted ? "Quitar de mi Wishlist" : "Añadir a mi Wishlist"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleWishlistClick}
          disabled={isToggling}
          className={cn(
            "h-9 w-9 rounded-full transition-all",
            isWishlisted
              ? "text-destructive hover:bg-destructive/10"
              : "text-muted-foreground hover:text-destructive"
          )}
        >
          {isToggling ? (
             <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
             <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductRow;
