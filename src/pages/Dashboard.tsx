import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Heart, Award, Loader2, Trash2, Shield, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";

const Dashboard = () => {
  const { user, profile, isLoading: authLoading, deleteUserAccount } = useAuth();
  const { wishlistIds, toggleWishlist, isLoading: wishlistLoading } = useWishlist();
  const { data: products = [], isLoading: productsLoading } = useProducts(100);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const impactPoints = profile?.impact_points || 0;
  const impactHours = Math.floor(impactPoints / 10); // 10 points = 1 hour

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
              Mi Panel
            </h1>
            <p className="text-muted-foreground">
              Bienvenido, {profile?.full_name || user.email}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            {/* Profile Card */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center">
                  <User className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suscripción</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {profile?.sub_status || "Free"}
                  </p>
                </div>
              </div>
            </div>

            {/* Wishlist Count */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En tu Wishlist</p>
                  <p className="text-lg font-semibold text-foreground">
                    {wishlistIds.length} sets
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Points */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <Award className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impacto Social</p>
                  <p className="text-lg font-semibold text-foreground">
                    {impactHours} horas
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Impact Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 mb-10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center shrink-0">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Tu impacto este mes
                </h3>
                <p className="text-muted-foreground">
                  Con tu suscripción has apoyado <span className="font-semibold text-primary">{impactHours} horas</span> de trabajo inclusivo.
                  Gracias a ti, personas con discapacidad tienen una ocupación digna preparando tus sets de LEGO.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Wishlist Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Mi Wishlist
            </h2>

            {wishlistLoading || productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-card"
                  >
                    <div className="aspect-video bg-secondary/50 overflow-hidden">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-foreground mb-2">
                        {product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                          {product.theme}
                        </span>
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent">
                          {product.piece_count} piezas
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWishlist(product.id)}
                        className="w-full text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar de Wishlist
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Tu wishlist está vacía
                </p>
                <Button asChild>
                  <a href="/catalogo">Explorar catálogo</a>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Security & Data Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-display font-bold text-foreground">
                Seguridad y Datos
              </h2>
            </div>

            <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive h-fit">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Zona de Peligro</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Al eliminar tu cuenta, todos tus datos personales, wishlist e historial de suscripción se borrarán de forma permanente. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) {
                    const { error } = await deleteUserAccount();
                    if (error) {
                      alert("Error al eliminar la cuenta: " + error.message);
                    }
                  }
                }}
                className="shrink-0"
              >
                Eliminar Cuenta Permanente
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
