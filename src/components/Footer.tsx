import { Link } from "react-router-dom";
import { Blocks, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl gradient-hero">
                <Blocks className="h-6 w-6 text-primary-foreground" />
              </div>
            <span className="text-xl font-display font-bold">Brickshare</span>
          </div>
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            Suscripción circular de sets de construcción que impulsa el desarrollo infantil y genera empleo inclusivo.
          </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/catalogo" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link to="/como-funciona#planes" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Planes y precios
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Sobre Nosotros</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/sobre-nosotros" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/donaciones" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Donaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4" />
                hola@brickshare.es
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4" />
                +34 900 123 456
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Calle de la Innovación, 42<br />28001 Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/50">
              © 2024 Brickshare. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link to="/privacidad" className="text-sm text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">
                Política de privacidad
              </Link>
              <Link to="/terminos" className="text-sm text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">
                Términos de uso
              </Link>
              <Link to="/aviso-legal" className="text-sm text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">
                Aviso legal
              </Link>
            </div>
          </div>
          <p className="text-xs text-primary-foreground/40 mt-4 text-center">
            LEGO® es una marca registrada de The LEGO Group. Brickshare no está patrocinado, autorizado ni respaldado por The LEGO Group. 
            Este servicio utiliza exclusivamente productos LEGO® originales adquiridos legalmente.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
