import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useProducts } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";

// Fallback sample products when database is empty
const sampleProducts = [
  {
    id: "sample-1",
    name: "LEGO City Estación de Bomberos",
    image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
    theme: "City",
    age_range: "6-12 años",
    piece_count: 509,
    skill_boost: ["Motricidad fina", "trabajo en equipo"],
    description: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "sample-2", 
    name: "LEGO Technic Excavadora Pesada",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    theme: "Technic",
    age_range: "9-16 años",
    piece_count: 834,
    skill_boost: ["Lógica", "mecánica"],
    description: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "sample-3",
    name: "LEGO Creator Casa Familiar Moderna",
    image_url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop",
    theme: "Creator",
    age_range: "8-12 años",
    piece_count: 728,
    skill_boost: ["Creatividad", "visión espacial"],
    description: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "sample-4",
    name: "LEGO Friends Centro Comercial",
    image_url: "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=400&h=400&fit=crop",
    theme: "Friends",
    age_range: "7-12 años",
    piece_count: 446,
    skill_boost: ["Imaginación", "juego social"],
    description: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "sample-5",
    name: "LEGO Star Wars Halcón Milenario",
    image_url: "https://images.unsplash.com/photo-1518946222227-364f22132616?w=400&h=400&fit=crop",
    theme: "Star Wars",
    age_range: "10-16 años",
    piece_count: 1353,
    skill_boost: ["Paciencia", "concentración"],
    description: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "sample-6",
    name: "LEGO City Comisaría de Policía",
    image_url: "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=400&h=400&fit=crop",
    theme: "City",
    age_range: "6-12 años",
    piece_count: 668,
    skill_boost: ["Narrativa", "juego de roles"],
    description: null,
    created_at: "",
    updated_at: "",
  },
];

const themes = ["City", "Technic", "Creator", "Friends", "Star Wars"];
const ageRanges = ["5-7 años", "6-12 años", "7-12 años", "8-12 años", "8-14 años", "9-16 años", "10-16 años"];
const pieceRanges = [
  { label: "Menos de 300", min: 0, max: 299 },
  { label: "300-500", min: 300, max: 500 },
  { label: "500-800", min: 500, max: 800 },
  { label: "Más de 800", min: 800, max: 10000 }
];

const Catalogo = () => {
  const { products: dbProducts, isLoading: productsLoading } = useProducts();
  const { isWishlisted, toggleWishlist } = useWishlist();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedPieces, setSelectedPieces] = useState<typeof pieceRanges>([]);

  // Use database products if available, otherwise use sample
  const allProducts = dbProducts.length > 0 ? dbProducts : sampleProducts;

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const toggleAge = (age: string) => {
    setSelectedAges(prev => 
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    );
  };

  const togglePieces = (range: typeof pieceRanges[0]) => {
    setSelectedPieces(prev => 
      prev.some(p => p.label === range.label) 
        ? prev.filter(p => p.label !== range.label) 
        : [...prev, range]
    );
  };

  const clearFilters = () => {
    setSelectedThemes([]);
    setSelectedAges([]);
    setSelectedPieces([]);
    setSearchQuery("");
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = selectedThemes.length === 0 || selectedThemes.includes(product.theme);
    const matchesAge = selectedAges.length === 0 || selectedAges.includes(product.age_range);
    const matchesPieces = selectedPieces.length === 0 || selectedPieces.some(
      range => product.piece_count >= range.min && product.piece_count <= range.max
    );
    return matchesSearch && matchesTheme && matchesAge && matchesPieces;
  });

  const hasActiveFilters = selectedThemes.length > 0 || selectedAges.length > 0 || selectedPieces.length > 0;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Themes */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Tema</h3>
        <div className="space-y-3">
          {themes.map(theme => (
            <label key={theme} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox 
                checked={selectedThemes.includes(theme)}
                onCheckedChange={() => toggleTheme(theme)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {theme}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Edad recomendada</h3>
        <div className="space-y-3">
          {ageRanges.map(age => (
            <label key={age} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox 
                checked={selectedAges.includes(age)}
                onCheckedChange={() => toggleAge(age)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {age}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Piece Count */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Número de piezas</h3>
        <div className="space-y-3">
          {pieceRanges.map(range => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox 
                checked={selectedPieces.some(p => p.label === range.label)}
                onCheckedChange={() => togglePieces(range)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
              Catálogo de Sets
            </h1>
            <p className="text-muted-foreground">
              Explora nuestra colección y añade tus favoritos a la wishlist
            </p>
          </motion.div>

          {/* Search and Mobile Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="ml-2 w-5 h-5 rounded-full gradient-hero text-xs flex items-center justify-center text-primary-foreground">
                      {selectedThemes.length + selectedAges.length + selectedPieces.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block w-64 shrink-0"
            >
              <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-display font-semibold text-foreground mb-6">Filtros</h2>
                <FilterContent />
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="flex-1">
              {productsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'set encontrado' : 'sets encontrados'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard 
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        imageUrl={product.image_url || "/placeholder.svg"}
                        theme={product.theme}
                        ageRange={product.age_range}
                        pieceCount={product.piece_count}
                        skillBoost={Array.isArray(product.skill_boost) ? product.skill_boost.join(", ") : ""}
                        isWishlisted={isWishlisted(product.id)}
                        onWishlistToggle={toggleWishlist}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-lg text-muted-foreground mb-4">
                    No se encontraron sets con los filtros seleccionados
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalogo;
