import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Blocks, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl gradient-hero group-hover:scale-105 transition-transform">
              <Blocks className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Brickshare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Inicio
            </Link>
            <Link 
              to="/catalogo" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Catálogo
            </Link>
            <Link 
              to="/como-funciona" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cómo funciona
            </Link>
            <Link 
              to="/sobre-nosotros" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre nosotros
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
            <Button size="sm" className="gradient-hero" asChild>
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Suscribirse
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/catalogo" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link 
                to="/como-funciona" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cómo funciona
              </Link>
              <Link 
                to="/sobre-nosotros" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre nosotros
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Iniciar sesión</Link>
                </Button>
                <Button size="sm" className="gradient-hero" asChild>
                  <Link to="/auth">
                    <User className="h-4 w-4 mr-2" />
                    Suscribirse
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
