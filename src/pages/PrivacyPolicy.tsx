import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
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
                            Política de Privacidad
                        </h1>
                        <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
                            <p>Última actualización: 18 de enero de 2026</p>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">1. Responsable del Tratamiento</h2>
                                <p>
                                    Brickshare S.L., con domicilio en Calle de la Innovación, 42, 28001 Madrid, España,
                                    es responsable del tratamiento de sus datos personales.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">2. Datos que Recopilamos</h2>
                                <p>
                                    Recopilamos información necesaria para la gestión de su cuenta y suscripción:
                                    nombre completo, correo electrónico y datos de uso de la plataforma.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">3. Finalidad del Tratamiento</h2>
                                <p>
                                    Sus datos se utilizan para: proveer el servicio de suscripción circular de LEGO,
                                    gestionar sus listas de deseos, informar sobre el impacto social y mejorar nuestro servicio.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">4. Base Legal</h2>
                                <p>
                                    La base legal para el tratamiento es la ejecución de un contrato (términos de uso)
                                    y su consentimiento explícito proporcionado al registrarse.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">5. Sus Derechos (RGPD)</h2>
                                <p>
                                    Usted tiene derecho a acceder, rectificar, suprimir (derecho al olvido),
                                    oponerse, limitar el tratamiento y solicitar la portabilidad de sus datos.
                                    Puede ejercerlos enviando un correo a hola@brickshare.es.
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

export default PrivacyPolicy;
