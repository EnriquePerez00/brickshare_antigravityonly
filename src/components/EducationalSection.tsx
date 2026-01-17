import { motion } from "framer-motion";
import { Brain, Eye, Clock, Puzzle, Lightbulb, Target } from "lucide-react";

const EducationalSection = () => {
  const benefits = [
    {
      icon: Puzzle,
      title: "Motricidad fina",
      description: "Manipular piezas pequeñas desarrolla la coordinación mano-ojo y la destreza manual.",
      color: "primary"
    },
    {
      icon: Eye,
      title: "Visión espacial",
      description: "Construir en 3D mejora la comprensión del espacio y las relaciones geométricas.",
      color: "accent"
    },
    {
      icon: Clock,
      title: "Paciencia y concentración",
      description: "Proyectos largos enseñan a mantener el foco y a trabajar paso a paso.",
      color: "primary"
    },
    {
      icon: Brain,
      title: "Pensamiento lógico",
      description: "Seguir instrucciones y resolver problemas fortalece el razonamiento estructurado.",
      color: "accent"
    },
    {
      icon: Lightbulb,
      title: "Creatividad",
      description: "Libertad para crear más allá de las instrucciones, inventando mundos propios.",
      color: "primary"
    },
    {
      icon: Target,
      title: "Perseverancia",
      description: "Completar sets desafiantes enseña que el esfuerzo tiene recompensa.",
      color: "accent"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">Beneficios educativos</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"
          >
            Más que un juguete: una herramienta de desarrollo
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Décadas de investigación respaldan los beneficios cognitivos y motores 
            del juego con construcciones. Con Brickshare, accedes a sets variados 
            que potencian diferentes habilidades.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${benefit.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <benefit.icon className={`h-6 w-6 ${benefit.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
              </div>
              
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationalSection;
