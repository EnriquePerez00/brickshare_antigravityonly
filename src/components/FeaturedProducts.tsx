import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

import { useFeaturedSets } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { Loader2 } from "lucide-react";

const FeaturedProducts = () => {
  const { data: featuredSets = [], isLoading } = useFeaturedSets();
  const { isWishlisted, toggleWishlist } = useWishlist();
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2"
            >
              Sets destacados
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground"
            >
              Explora algunos de nuestros sets más populares
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="outline" asChild>
              <Link to="/catalogo">
                Ver catálogo completo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            featuredSets.map((setData) => (
              <ProductCard
                key={setData.id}
                id={setData.id}
                name={setData.set_name}
                imageUrl={setData.set_image_url || "/placeholder.svg"}
                theme={setData.set_theme}
                ageRange={setData.set_age_range}
                pieceCount={setData.set_piece_count}
                skillBoost={Array.isArray(setData.skill_boost) ? setData.skill_boost.join(", ") : ""}
                legoRef={setData.set_ref || undefined}
                description={setData.set_description}
                isWishlisted={isWishlisted(setData.id)}
                onWishlistToggle={toggleWishlist}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
