import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Heart, Recycle, Users, Lightbulb, Shield, Sparkles, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import familyImage from "@/assets/family-playing-lego.jpg";
import circularImage from "@/assets/circular-economy.jpg";
import childrenImage from "@/assets/children-learning.jpg";

const values = [
  {
    icon: Recycle,
    title: "Economía Circular",
    description: "Maximizamos el uso de cada juguete, reduciendo el impacto ambiental y promoviendo un consumo más responsable.",
  },
  {
    icon: Users,
    title: "Impacto Social",
    description: "Colaboramos con entidades del tercer sector, generando empleo inclusivo y oportunidades para todos.",
  },
  {
    icon: Shield,
    title: "Seguridad Garantizada",
    description: "Cada set pasa por rigurosos procesos de higienización y control de calidad antes de llegar a tu hogar.",
  },
  {
    icon: Lightbulb,
    title: "Desarrollo Cognitivo",
    description: "Fomentamos la imaginación, la creatividad y las capacidades cognitivas de los más pequeños.",
  },
];

const SobreNosotros = () => {
  const { isAdmin, isOperador, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAdmin) {
        navigate("/admin");
      } else if (isOperador) {
        navigate("/operaciones");
      }
    }
  }, [isAdmin, isOperador, isLoading, navigate]);

  if (isLoading || isAdmin || isOperador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                Nuestra Historia
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Sobre Nosotros
              </h1>
              <p className="text-lg text-muted-foreground">
                Una iniciativa de impacto social basada en los principios de la economía circular
              </p>
            </motion.div>
          </div>
        </section>

        {/* Origin Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Todo empezó con una pregunta
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <span className="text-foreground font-medium">¿Cuántas veces montan realmente mis hijos un set de construcción?</span> Esta
                    pregunta fue el punto de partida de todo. Como padre, observé cómo los juguetes de construcción
                    se montaban con ilusión... y luego quedaban guardados en una estantería, acumulando polvo.
                  </p>
                  <p>
                    Busqué una solución que permitiera a mis hijos disfrutar de la experiencia de construir
                    sin tener que comprar cada set, sin ocupar espacio infinito en casa, y sin generar un
                    gasto desproporcionado. <span className="text-foreground font-medium">No la encontré. Así que decidí crearla.</span>
                  </p>
                  <p>
                    Así nació Brickshare: un servicio de alquiler de sets de construcción que permite a las
                    familias acceder a una variedad infinita de sets, rotando constantemente, sin los
                    inconvenientes de la compra tradicional.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={familyImage}
                    alt="Familia jugando con bloques de construcción"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                  <Heart className="w-8 h-8" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Circular Economy Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={circularImage}
                    alt="Economía circular"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Recycle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-green-600 font-semibold">Economía Circular</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Reutilizar es el nuevo comprar
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Nuestro modelo se basa en los principios de la <span className="text-foreground font-medium">economía circular</span>:
                    cada set que entra en nuestro sistema se utiliza muchas más veces de lo que lo haría
                    en un hogar individual.
                  </p>
                  <p>
                    Esto significa menos producción innecesaria, menos residuos, y un uso más
                    inteligente de los recursos. Todo ello manteniendo unas condiciones de uso
                    <span className="text-foreground font-medium"> óptimas y completamente seguras</span> para los niños.
                  </p>
                  <p>
                    Cada set pasa por un riguroso proceso de higienización, revisión y reposición
                    de piezas antes de llegar a la siguiente familia.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social Impact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-primary font-semibold">Impacto Social</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Más que un servicio, un propósito
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Brickshare no es solo un negocio: es una <span className="text-foreground font-medium">iniciativa de impacto social</span>.
                    Colaboramos activamente con entidades del tercer sector, generando oportunidades
                    de empleo para personas con diversidad funcional.
                  </p>
                  <p>
                    Nuestro equipo de higienización y preparación de sets está formado por personas
                    que, gracias a este proyecto, encuentran un trabajo digno y una vía de
                    integración laboral.
                  </p>
                  <p>
                    Cuando eliges Brickshare, no solo estás ahorrando dinero y espacio: estás
                    contribuyendo a un mundo más justo e inclusivo.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={childrenImage}
                    alt="Niños aprendiendo con bloques de construcción"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-secondary text-secondary-foreground p-4 rounded-xl shadow-lg">
                  <Sparkles className="w-8 h-8" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Nuestros Valores
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Los principios que guían cada decisión que tomamos
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Summary */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border rounded-3xl p-10"
            >
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  ¿Por qué elegir Brickshare?
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-10">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">∞</div>
                    <p className="text-muted-foreground">Sets para explorar sin límites</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">0</div>
                    <p className="text-muted-foreground">Espacio ocupado en casa</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">100%</div>
                    <p className="text-muted-foreground">Impacto social positivo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-10 text-center text-primary-foreground"
            >
              <h2 className="text-3xl font-bold mb-4">
                Únete a la revolución del juego consciente
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Descubre cómo puedes disfrutar de infinitas posibilidades de construcción
                mientras contribuyes a un mundo mejor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 bg-background text-foreground px-8 py-3 rounded-full font-semibold hover:bg-background/90 transition-colors"
                >
                  Ver Catálogo
                </a>
                <a
                  href="/como-funciona"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary-foreground/10 transition-colors"
                >
                  Cómo Funciona
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SobreNosotros;
