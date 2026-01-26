import { useState } from "react";
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
  CheckCircle,
  Star,
  Zap,
  Crown,
  Clock,
  ShieldCheck
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

const plans = [
  {
    name: "Brick Starter",
    price: "19,90",
    priceId: "price_1StarterID", // Reemplazar con ID real de Stripe
    icon: Star,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    ageRange: "5 a 7 años",
    pieceRange: "100 a 300 piezas",
    description: "Perfecto para los más pequeños que comienzan su aventura con bloques de construcción."
  },
  {
    name: "Brick Pro",
    price: "29,90",
    priceId: "price_1ProID", // Reemplazar con ID real de Stripe
    icon: Zap,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    ageRange: "8 a 11 años",
    pieceRange: "300 a 550 piezas",
    popular: true,
    description: "Para constructores con experiencia que buscan retos más complejos."
  },
  {
    name: "Brick Master",
    price: "39,90",
    priceId: "price_1MasterID", // Reemplazar con ID real de Stripe
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    ageRange: "12 a 15 años",
    pieceRange: "550 a 800 piezas",
    description: "Diseñado para expertos y niños muy avanzados (10+ años) que dominan construcciones complejas."
  }
];

const commonFeatures = [
  { icon: Package, text: "1 set por mes" },
  { icon: Clock, text: "Tiempo de uso ilimitado" },
  { icon: ShieldCheck, text: "Pérdida de 5-6 piezas pequeñas cubierta (95% de casos)" },
  { icon: Truck, text: "Envío y devolución gratuitos" }
];

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
  const { startSubscription, isLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: any) => {
    setLoadingPlan(plan.name);
    await startSubscription(plan.name, plan.priceId);
    setLoadingPlan(null);
  };
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
                Alquilar sets de construcción nunca fue tan fácil. Descubre cómo funciona
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

        {/* Subscription Plans Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Nuestros Planes de Suscripción
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Elige el plan perfecto según la edad y experiencia de tu pequeño constructor
              </p>
            </motion.div>

            {/* Common Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6 mb-12 max-w-4xl mx-auto"
            >
              <h3 className="text-xl font-semibold text-center text-foreground mb-6">
                Incluido en todos los planes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {commonFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-4 py-1">
                        Más popular
                      </Badge>
                    </div>
                  )}
                  <Card className={`h-full ${plan.bgColor} ${plan.borderColor} border-2 hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background' : ''}`}>
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                        <plan.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-muted-foreground"> €/mes</span>
                      </div>
                      <CardDescription className="mt-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                          <Puzzle className="w-5 h-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Rango de piezas</p>
                            <p className="text-sm text-muted-foreground">{plan.pieceRange}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                          <Star className="w-5 h-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Edad sugerida</p>
                            <p className="text-sm text-muted-foreground">{plan.ageRange}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0`}
                        onClick={() => handleSubscribe(plan)}
                        disabled={isLoading}
                      >
                        {loadingPlan === plan.name ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Elegir plan
                      </Button>
                    </CardContent>
                  </Card>
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
                Todo lo que necesitas saber sobre nuestro servicio de alquiler de sets de construcción
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
                Explora nuestro catálogo y crea tu wishlist. ¡Tu próxima aventura de construcción te espera!
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
