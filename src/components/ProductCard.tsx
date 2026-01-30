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

interface SetCardProps {
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

const ProductCard = ({
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
}: SetCardProps) => {
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-secondary/30 overflow-hidden shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={isToggling}
          className={cn(
            "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10",
            isWishlisted
              ? "bg-destructive text-primary-foreground shadow-lg"
              : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-background hover:text-destructive"
          )}
        >
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          )}
        </button>

        {/* Theme Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
            {theme}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Line 1: Theme, Name, Lego Ref */}
        <div className="mb-2">
          <h3 className="font-display font-bold text-foreground leading-tight line-clamp-2 min-h-[2.5rem]">
            <span className="text-primary/70 text-xs mr-1">{theme}</span>
            {name}
            {legoRef && <span className="text-muted-foreground ml-2 text-xs font-mono">#{legoRef}</span>}
          </h3>
        </div>

        {/* Line 2: Age Range, Piece Count */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {ageRange}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {pieceCount} piezas
          </span>
        </div>

        {/* Line 3: Description (smaller) */}
        <div className="flex-grow">
          {description ? (
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed italic mb-4">
              {description}
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground/50 italic mb-4">Sin descripción... </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-2 border-t border-border/50 flex justify-between items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5">
                <Info className="h-3 w-3 mr-1" />
                Ver ficha técnica
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
                  {description || "Este set de LEGO promete horas de diversión y creatividad. Ideal para constructores entusiastas."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Edad Recomendada</p>
                  <p className="text-lg font-bold text-foreground">{ageRange}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Total Piezas</p>
                  <p className="text-lg font-bold text-foreground">{pieceCount}</p>
                </div>
                {skillBoost && (
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Habilidades que potencia</p>
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
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
