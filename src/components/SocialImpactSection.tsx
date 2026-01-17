import { motion } from "framer-motion";
import { Heart, Users, Recycle, Award } from "lucide-react";

const SocialImpactSection = () => {
  return (
    <section className="py-24 gradient-impact text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary-foreground animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-primary-foreground animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/90 mb-6"
          >
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Impacto Social</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6"
          >
            Cada set que disfrutas genera empleo inclusivo
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-primary-foreground/80 leading-relaxed"
          >
            Toda nuestra operativa —limpieza profunda, control de piezas y preparación de envíos— 
            es realizada íntegramente por <strong>personas con discapacidad</strong>, 
            aportando ocupación digna y significativa.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Empleo Digno",
              description: "Colaboramos con centros especiales de empleo para ofrecer trabajos estables y significativos."
            },
            {
              icon: Recycle,
              title: "Economía Circular",
              description: "Cada set se reutiliza cientos de veces, reduciendo residuos y consumo de recursos."
            },
            {
              icon: Award,
              title: "Calidad Garantizada",
              description: "Control de calidad exhaustivo: cada pieza verificada, cada set perfecto."
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{item.title}</h3>
              <p className="text-primary-foreground/70 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialImpactSection;
