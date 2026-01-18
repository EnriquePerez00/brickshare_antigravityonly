import { motion } from "framer-motion";
import { 
  Heart, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Package, 
  CreditCard, 
  Puzzle, 
  AlertCircle,
  Calendar,
  CheckCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const steps = [
  {
    icon: Heart,
    title: "Elige tus sets favoritos",
    description: "Explora nuestro catálogo y añade a tu wishlist los sets que más te gusten. Tu lista de deseos nos ayuda a saber qué enviarte.",
  },
  {
    icon: Truck,
    title: "Recibe en 2-3 días",
    description: "Te enviamos uno de los sets de tu wishlist directamente a tu domicilio. ¡Listo para jugar!",
  },
  {
    icon: RotateCcw,
    title: "Devuélvelo cuando quieras",
    description: "Cuando ya no quieras jugar más, solicita la devolución desde la web. Nosotros nos encargamos de todo.",
  },
  {
    icon: Sparkles,
    title: "Higienización completa",
    description: "Una vez recibido, el set se revisa, completa, higieniza y retorna al pool de sets disponibles.",
  },
];

const faqs = [
  {
    question: "¿Cómo funciona la suscripción?",
    answer: "Dependiendo del tipo de suscripción tienes acceso a un catálogo de sets más amplio y a un número de envíos por mes determinado. Solo puedes tener 1 set a la vez por suscripción.",
    icon: CreditCard,
  },
  {
    question: "¿Qué pasa si pierdo alguna pieza pequeña?",
    answer: "¡No te preocupes! Es completamente normal. Nosotros reponemos las piezas pequeñas sin ningún coste adicional para ti.",
    icon: Puzzle,
  },
  {
    question: "¿Y si pierdo una pieza grande o una figurilla?",
    answer: "En ese caso, nosotros completamos el set, pero te pediremos que abones el importe de la pieza o figurilla perdida.",
    icon: AlertCircle,
  },
  {
    question: "¿Puedo darme de baja cuando quiera?",
    answer: "¡Por supuesto! Puedes darte de alta y de baja en cualquier momento. La suscripción tiene un periodo válido mínimo de 1 mes.",
    icon: Calendar,
  },
  {
    question: "¿Cuántos sets puedo tener a la vez?",
    answer: "Con cada suscripción solo puedes tener 1 set a la vez. Cuando lo devuelvas, podrás solicitar el siguiente de tu wishlist.",
    icon: Package,
  },
  {
    question: "¿Qué incluye cada tipo de suscripción?",
    answer: "Cada plan ofrece acceso a diferentes niveles de catálogo y número de envíos mensuales. Los planes superiores incluyen sets más exclusivos y mayor frecuencia de intercambio.",
    icon: CheckCircle,
  },
];

const ComoFunciona = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                ¿Cómo Funciona?
              </h1>
              <p className="text-lg text-muted-foreground">
                Alquilar sets de LEGO nunca fue tan fácil. Descubre cómo funciona 
                nuestro servicio de suscripción y empieza a construir sin límites.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center text-foreground mb-16"
            >
              El proceso paso a paso
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-4xl font-bold text-primary/20">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Todo lo que necesitas saber sobre nuestro servicio de alquiler de LEGO
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <faq.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-14 pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-10 text-center text-primary-foreground"
            >
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Explora nuestro catálogo y crea tu wishlist. ¡Tu próxima aventura LEGO te espera!
              </p>
              <a
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-3 rounded-full font-semibold hover:bg-background/90 transition-colors"
              >
                Ver Catálogo
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ComoFunciona;
