import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Search, Filter, X, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSets } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";

// Fallback sample sets when database is empty
const sampleSets = [
  {
    id: "sample-1",
    set_name: "Estación de Bomberos",
    set_ref: "60320",
    set_image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
    set_theme: "City",
    set_age_range: "6+ años",
    set_piece_count: 509,
    skill_boost: ["Motricidad fina", "trabajo en equipo"],
    set_description: "Una moderna estación de bomberos con camión, helicóptero y personajes icónicos para misiones de rescate.",
    created_at: "",
    year_released: 2023,
    catalogue_visibility: true,
  },
  {
    id: "sample-2",
    set_name: "Excavadora Pesada",
    set_ref: "42121",
    set_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    set_theme: "Technic",
    set_age_range: "9+ años",
    set_piece_count: 834,
    skill_boost: ["Lógica", "mecánica"],
    set_description: "2 modelos en 1: construye una excavadora o una retroexcavadora para aprender sobre ingeniería real.",
    created_at: "",
    year_released: 2022,
    catalogue_visibility: true,
  },
  {
    id: "sample-3",
    set_name: "Casa Familiar Moderna",
    set_ref: "31139",
    set_image_url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop",
    set_theme: "Creator",
    set_age_range: "8+ años",
    set_piece_count: 728,
    skill_boost: ["Creatividad", "visión espacial"],
    set_description: "Reconstruye esta acogedora casa en una vivienda junto al canal o una pintoresca casa de playa.",
    created_at: "",
    year_released: 2023,
    catalogue_visibility: true,
  },
  {
    id: "sample-4",
    set_name: "Centro Comercial",
    set_ref: "41450",
    set_image_url: "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=400&h=400&fit=crop",
    set_theme: "Friends",
    set_age_range: "8+ años",
    set_piece_count: 446,
    skill_boost: ["Imaginación", "juego social"],
    set_description: "Descubre el mundo de Friends con este centro comercial lleno de tiendas y accesorios divertidos.",
    created_at: "",
    year_released: 2021,
    catalogue_visibility: true,
  },
  {
    id: "sample-5",
    set_name: "Nave Estelar",
    set_ref: "75301",
    set_image_url: "https://images.unsplash.com/photo-1518946222227-364f22132616?w=400&h=400&fit=crop",
    set_theme: "Star Wars",
    set_age_range: "9+ años",
    set_piece_count: 1353,
    skill_boost: ["Paciencia", "concentración"],
    set_description: "Únete a la Rebelión con esta mítica nave. Incluye mini figuras de Luke Skywalker y R2-D2.",
    created_at: "",
    year_released: 2023,
    catalogue_visibility: true,
  },
  {
    id: "sample-6",
    set_name: "Comisaría de Policía",
    set_ref: "60316",
    set_image_url: "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=400&h=400&fit=crop",
    set_theme: "City",
    set_age_range: "6+ años",
    set_piece_count: 668,
    skill_boost: ["Narrativa", "juego de roles"],
    set_description: "Protege la ciudad con esta completa comisaría. Incluye calabozo, patrulla y dron de vigilancia.",
    created_at: "",
    year_released: 2022,
    catalogue_visibility: true,
  },
];

const themes = ["City", "Technic", "Creator", "Friends", "Star Wars", "Architecture"];
const ageRanges = ["5-7 años", "6-12 años", "7-12 años", "8-12 años", "8-14 años", "9-16 años", "10-16 años"];
const pieceRanges = [
  { label: "Menos de 300", min: 0, max: 299 },
  { label: "300-500", min: 300, max: 500 },
  { label: "500-800", min: 500, max: 800 },
  { label: "Más de 800", min: 800, max: 10000 }
];

const Catalogo = () => {
  const { isAdmin, isOperador, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: dbSets = [], isLoading: setsLoading } = useSets(100);
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        navigate("/admin");
      } else if (isOperador) {
        navigate("/operaciones");
      }
    }
  }, [isAdmin, isOperador, authLoading, navigate]);

  if (authLoading || isAdmin || isOperador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedPieces, setSelectedPieces] = useState<typeof pieceRanges>([]);

  // Use database sets if available, otherwise use sample
  const allSets = dbSets.length > 0 ? dbSets : sampleSets;

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

  const filteredSets = allSets.filter(set => {
    const matchesSearch = (set.set_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = selectedThemes.length === 0 || selectedThemes.includes(set.set_theme);
    const matchesAge = selectedAges.length === 0 || selectedAges.includes(set.set_age_range);
    const matchesPieces = selectedPieces.length === 0 || selectedPieces.some(
      range => (set.set_piece_count || 0) >= range.min && (set.set_piece_count || 0) <= range.max
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

            {/* Sets Grid */}
            <div className="flex-1">
              {setsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredSets.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    {filteredSets.length} {filteredSets.length === 1 ? 'set encontrado' : 'sets encontrados'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSets.map((setData) => (
                      <ProductCard
                        key={setData.id}
                        id={setData.id}
                        name={setData.set_name}
                        imageUrl={setData.set_image_url || "/placeholder.svg"}
                        theme={setData.set_theme}
                        ageRange={setData.set_age_range}
                        pieceCount={setData.set_piece_count}
                        skillBoost={Array.isArray(setData.skill_boost) ? (setData.skill_boost as string[]).join(", ") : ""}
                        legoRef={setData.set_ref}
                        description={setData.set_description}
                        isWishlisted={isWishlisted(setData.id)}
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
