import { motion } from "framer-motion";
import { Shield, Sparkles, ThermometerSun, Droplets, Wind } from "lucide-react";

const HygieneSection = () => {
  const steps = [
    {
      icon: Sparkles,
      title: "Descontaminación Ultrasónica",
      description: "Elimina aceites cutáneos y biofilm en rincones inaccesibles. Una limpieza total sin desgastar las piezas."
    },
    {
      icon: ThermometerSun,
      title: "Hidrólisis Enzimática",
      description: "Química médica avanzada que digiere la suciedad de forma biológica, asegurando una desinfección microscópica."
    },
    {
      icon: Droplets,
      title: "Aclarado de Alta Pureza",
      description: "Agua purificada sin cal ni cloro para un acabado espejo que devuelve el brillo y color vibrante original."
    },
    {
      icon: Wind,
      title: "Secado por Convección Filtrada",
      description: "Aire caliente filtrado que evita micro-arañazos y asegura la ausencia total de humedad interna."
    }
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6"
          >
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Garantía Brickshare</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"
          >
            Higiene de grado casi hospitalario
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Piezas microbiológicamente seguras para jugar y estéticamente perfectas para exhibir.
            No solo limpiamos sets; protegemos la salud de tu familia y el valor de tu colección.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0" />
              )}

              <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow relative z-10">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>

                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HygieneSection;
