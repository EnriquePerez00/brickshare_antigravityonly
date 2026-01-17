import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

// Sample products for preview
const sampleProducts = [
  {
    id: "1",
    name: "LEGO City Estación de Bomberos",
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
    theme: "City",
    ageRange: "6-12 años",
    pieceCount: 509,
    skillBoost: "Motricidad fina, trabajo en equipo"
  },
  {
    id: "2", 
    name: "LEGO Technic Excavadora",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    theme: "Technic",
    ageRange: "9-16 años",
    pieceCount: 834,
    skillBoost: "Lógica, mecánica"
  },
  {
    id: "3",
    name: "LEGO Creator Casa Familiar",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop",
    theme: "Creator",
    ageRange: "8-12 años",
    pieceCount: 728,
    skillBoost: "Creatividad, visión espacial"
  },
  {
    id: "4",
    name: "LEGO Friends Centro Comercial",
    imageUrl: "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=400&h=400&fit=crop",
    theme: "Friends",
    ageRange: "7-12 años",
    pieceCount: 446,
    skillBoost: "Imaginación, juego social"
  }
];

const FeaturedProducts = () => {
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
          {sampleProducts.map((product) => (
            <ProductCard 
              key={product.id}
              {...product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
