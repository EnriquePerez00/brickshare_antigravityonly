import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LegalNotice = () => {
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
                            Aviso Legal
                        </h1>
                        <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">Información General</h2>
                                <p>
                                    En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
                                    Sociedad de la Información y Comercio Electrónico (LSSICE), se exponen los datos
                                    identificativos de la empresa:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Denominación Social:</strong> Brickshare S.L.</li>
                                    <li><strong>NIF:</strong> B12345678</li>
                                    <li><strong>Domicilio:</strong> Calle de la Innovación, 42, 28001 Madrid</li>
                                    <li><strong>Email:</strong> hola@brickshare.es</li>
                                    <li><strong>Teléfono:</strong> +34 900 123 456</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">Propiedad Intelectual</h2>
                                <p>
                                    Todos los contenidos del sitio web (logos, textos, diseños) son propiedad de
                                    Brickshare o cuentan con licencia de uso. LEGO® es una marca registrada de
                                    The LEGO Group, que no patrocina ni autoriza este sitio.
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

export default LegalNotice;
