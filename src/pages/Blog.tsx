import { motion } from "framer-motion";
import { Quote, Heart, Users, Sparkles, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import blogFamilyExperience from "@/assets/blog-family-experience.jpg";
import blogChildAchievement from "@/assets/blog-child-achievement.jpg";
import blogOrganizedSpace from "@/assets/blog-organized-space.jpg";

const testimonials = [
  {
    name: "María González",
    location: "Madrid",
    quote: "Mis hijos esperan cada mes con ilusión el nuevo set. Es como tener una tienda de juguetes en casa sin el desorden ni el gasto. ¡Una idea brillante!",
    image: blogFamilyExperience,
    rating: 5,
    date: "Enero 2024"
  },
  {
    name: "Carlos Fernández",
    location: "Barcelona",
    quote: "Como padre, ver la cara de orgullo de mi hijo cuando termina una construcción no tiene precio. Y saber que estamos siendo responsables con el planeta lo hace aún mejor.",
    image: blogChildAchievement,
    rating: 5,
    date: "Diciembre 2023"
  },
  {
    name: "Ana Martínez",
    location: "Valencia",
    quote: "Por fin puedo tener una casa ordenada. Los sets vienen, se disfrutan y se devuelven. Mis hijos desarrollan su creatividad sin que yo pierda espacio en casa.",
    image: blogOrganizedSpace,
    rating: 5,
    date: "Noviembre 2023"
  }
];

const blogPosts = [
  {
    title: "5 beneficios cognitivos de los bloques de construcción",
    excerpt: "Descubre cómo jugar con sets de construcción puede mejorar las habilidades espaciales, la resolución de problemas y la creatividad de tus hijos.",
    date: "15 Enero 2024",
    category: "Desarrollo Infantil",
    readTime: "5 min"
  },
  {
    title: "Economía circular: por qué compartir es el futuro",
    excerpt: "El modelo de suscripción circular no solo ahorra dinero, sino que contribuye a un planeta más sostenible para las próximas generaciones.",
    date: "8 Enero 2024",
    category: "Sostenibilidad",
    readTime: "4 min"
  },
  {
    title: "Cómo fomentar el juego en familia",
    excerpt: "Consejos prácticos para convertir el tiempo de construcción en momentos de calidad familiar que todos disfrutarán.",
    date: "2 Enero 2024",
    category: "Familia",
    readTime: "6 min"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Blog & Experiencias
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Historias de familias felices
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Descubre las experiencias reales de familias que han transformado la forma en que sus hijos juegan y aprenden con Brickshare.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Lo que dicen nuestras familias
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Testimonios reales de padres y madres que confían en Brickshare para el desarrollo y diversión de sus hijos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={`Experiencia de ${testimonial.name} con bloques de construcción`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-2 mb-4">
                      <Quote className="h-8 w-8 text-primary/30 flex-shrink-0" />
                      <p className="text-foreground/80 italic leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Heart key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{testimonial.date}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "2,500+", label: "Familias felices" },
              { number: "15,000+", label: "Sets compartidos" },
              { number: "4.9/5", label: "Valoración media" },
              { number: "98%", label: "Recomendarían" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                  {stat.number}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* More Quotes */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Más opiniones de la comunidad
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: "El servicio de atención es excepcional. Cuando tuvimos un problema con una pieza, lo solucionaron en 24 horas.",
                name: "Laura Sánchez",
                location: "Sevilla"
              },
              {
                quote: "Mis hijos aprenden paciencia, seguir instrucciones y trabajan su motricidad fina. Todo mientras se divierten.",
                name: "Pedro Ruiz",
                location: "Bilbao"
              },
              {
                quote: "Antes comprábamos sets que se montaban una vez y acababan en una caja. Ahora rotan y siempre hay novedad.",
                name: "Elena García",
                location: "Málaga"
              },
              {
                quote: "Me encanta saber que apoyo empleo inclusivo mientras mis hijos juegan. Es un valor añadido increíble.",
                name: "Javier López",
                location: "Zaragoza"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-gradient-to-br from-background to-secondary/5 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <Quote className="h-6 w-6 text-primary/40 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-foreground/80 italic mb-4">"{item.quote}"</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">• {item.location}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Últimas publicaciones
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Artículos, consejos y recursos para sacar el máximo partido a la experiencia Brickshare.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime} lectura</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              ¿Quieres ser parte de nuestra historia?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Únete a miles de familias que ya disfrutan de Brickshare y comparte tu experiencia con nosotros.
            </p>
            <a
              href="/catalogo"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Empieza tu aventura
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
