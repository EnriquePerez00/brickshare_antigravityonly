import { motion } from "framer-motion";
import { Shield, Sparkles, ThermometerSun, CheckCircle2 } from "lucide-react";

const HygieneSection = () => {
  const steps = [
    {
      icon: ThermometerSun,
      title: "Desinfección térmica",
      description: "Tratamiento a alta temperatura que elimina el 99.9% de gérmenes y bacterias."
    },
    {
      icon: Sparkles,
      title: "Limpieza ultrasónica",
      description: "Tecnología que alcanza cada rincón de las piezas más complejas."
    },
    {
      icon: CheckCircle2,
      title: "Control de calidad",
      description: "Revisión pieza a pieza para garantizar sets completos y en perfecto estado."
    },
    {
      icon: Shield,
      title: "Sellado hermético",
      description: "Empaquetado individual que mantiene la higiene hasta tu hogar."
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
            Higiene de nivel hospitalario
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Cada set pasa por un riguroso proceso de higienización profesional. 
            Tu familia juega con piezas más limpias que si las compraras nuevas.
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
