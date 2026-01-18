import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-8">
                            Términos de Uso
                        </h1>
                        <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">1. Objeto</h2>
                                <p>
                                    Estos términos regulan el acceso y uso del servicio de suscripción circular de LEGO
                                    proporcionado por Brickshare.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">2. Uso del Servicio</h2>
                                <p>
                                    El usuario se compromete a hacer un uso lícito y adecuado de los materiales alquilados,
                                    devolviéndolos en las condiciones pactadas.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">3. Suscripciones</h2>
                                <p>
                                    La suscripción es personal e intransferible. Los planes se facturan mensualmente
                                    y pueden cancelarse en cualquier momento con efecto al final del periodo actual.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">4. Limitación de Responsabilidad</h2>
                                <p>
                                    Brickshare no se hace responsable de las pequeñas piezas que puedan perderse durante el uso,
                                    aunque agradecemos su notificación para reposición.
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Terms;
