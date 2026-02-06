import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TerminosCondiciones = () => {
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
                            Términos, Condiciones de Uso y Servicio de Alquiler
                        </h1>

                        <div className="prose prose-slate max-w-none text-muted-foreground space-y-8">

                            {/* Identificación */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">1. Identificación del Titular</h2>
                                <p>
                                    <strong>Brickshare S.L.</strong><br />
                                    Domicilio: Barcelona, España.<br />
                                    Email de contacto: hola@brickshare.es
                                </p>
                            </section>

                            {/* Cláusula de Desvinculación de Marca (LEGO) */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">2. Independencia de Marca y Propiedad Intelectual</h2>
                                <div className="bg-muted/50 p-6 rounded-xl border border-border">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Aviso Importante</h3>
                                    <p>
                                        Brickshare es un servicio independiente de alquiler de juguetes. <strong>NO estamos patrocinados, autorizados, ni respaldados por The LEGO Group.</strong>
                                    </p>
                                    <p className="mt-2">
                                        LEGO® es una marca registrada de The LEGO Group. Este sitio web utiliza la marca exclusivamente con fines descriptivos para identificar los productos objeto de alquiler (uso nominativo), amparándose en el <strong>principio de agotamiento del derecho de marca</strong> (Artículo 36 de la Ley 17/2001, de Marcas, y jurisprudencia comunitaria aplicable). Los sets ofrecidos son productos originales adquiridos lícitamente en el Espacio Económico Europeo.
                                    </p>
                                </div>
                            </section>

                            {/* Condiciones del Alquiler y Suscripción */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">3. Condiciones del Servicio de Alquiler y Suscripción</h2>
                                <h3 className="text-xl font-semibold text-foreground">Modelo de Suscripción</h3>
                                <p>
                                    El servicio opera bajo un modelo de suscripción mensual con pago recurrente. Los precios oscilan entre <strong>15€ y 35€ mensuales</strong>, dependiendo del plan seleccionado (Starter, Pro, Master).
                                </p>
                                <h3 className="text-xl font-semibold text-foreground">Renovación y Cancelación</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>La suscripción se <strong>renueva automáticamente</strong> cada mes en la fecha de alta.</li>
                                    <li>El usuario puede cancelar su suscripción en cualquier momento desde su panel de usuario. La cancelación será efectiva al finalizar el ciclo de facturación vigente, momento en el cual se deberá devolver el último set en posesión.</li>
                                </ul>
                            </section>

                            {/* Responsabilidad y Seguridad (Piezas Pequeñas) */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">4. Seguridad y Responsabilidad</h2>
                                <div className="border-l-4 border-yellow-500 pl-6 py-2 bg-yellow-50 dark:bg-yellow-900/20">
                                    <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                                        ⚠️ ADVERTENCIA DE SEGURIDAD: RIESGO DE ASFIXIA
                                    </h3>
                                    <p>
                                        Los productos alquilados contienen <strong>piezas pequeñas</strong> que pueden representar un riesgo de asfixia para niños menores de 3 años.
                                    </p>
                                    <ul className="list-disc pl-6 mt-2 space-y-1">
                                        <li>Se requiere la <strong>supervisión constante de un adulto</strong> durante el juego.</li>
                                        <li>Brickshare S.L. <strong>no se hace responsable</strong> de los daños, lesiones o accidentes derivados del mal uso de los productos, la falta de supervisión adecuada o el incumplimiento de las recomendaciones de edad estipuladas por el fabricante original.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Política de Inventario y Daños */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">5. Política de Inventario, Pérdidas y Daños</h2>
                                <p>
                                    Entendemos que durante el juego pueden ocurrir pérdidas accidentales. Nuestra política diferencia entre piezas comunes y elementos críticos:
                                </p>

                                <h3 className="text-xl font-semibold text-foreground">Margen de Cortesía</h3>
                                <p>
                                    No aplicamos penalizaciones por la pérdida ocasional de piezas estándar (ladrillos comunes, placas pequeñas) que no afecten a la funcionalidad principal del modelo.
                                </p>

                                <h3 className="text-xl font-semibold text-foreground">Penalizaciones Aplicables</h3>
                                <p>Se podrán aplicar cargos adicionales en los siguientes casos:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Pérdida de Minifiguras:</strong> Se cobrará el valor de mercado de reposición de la figura específica.</li>
                                    <li><strong>Pérdida de Elementos Críticos:</strong> Piezas especiales, motores, sensores o elementos electrónicos. Se repercutirá el coste de reposición.</li>
                                    <li><strong>Devolución de Sets Mezclados:</strong> Si se devuelven piezas de diferentes sets mezcladas, dificultando el inventario, se podrá aplicar una tarifa de gestión de 10€.</li>
                                    <li><strong>Devolución Montada:</strong> Los sets deben devolverse <strong>completamente desmontados</strong>. La devolución de sets montados conllevará un recargo de 5€ por servicio de desmontaje.</li>
                                </ul>
                            </section>

                            {/* Higiene y Salud */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">6. Higiene y Salud</h2>
                                <h3 className="text-xl font-semibold text-foreground">Proceso de Desinfección</h3>
                                <p>
                                    Garantizamos que cada set pasa por un estricto proceso de limpieza y desinfección industrial entre usos, utilizando productos seguros y no tóxicos certificados para uso infantil.
                                </p>
                                <h3 className="text-xl font-semibold text-foreground">Alergias</h3>
                                <p>
                                    Aunque nos esforzamos por eliminar cualquier rastro biológico, no podemos garantizar un ambiente 100% libre de alérgenos (como pelo de mascota o trazas de frutos secos) provenientes de hogares anteriores. Brickshare limita su responsabilidad ante reacciones alérgicas leves derivadas del uso compartido.
                                </p>
                            </section>

                            {/* Impacto Social */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">7. Compromiso e Impacto Social</h2>
                                <p>
                                    Al contratar nuestros servicios, contribuyes a un proyecto de <strong>inclusión laboral</strong>. Colaboramos estrechamente con entidades del tercer sector en Barcelona para delegar parte de nuestros procesos de logística, clasificación y mantenimiento en personas con riesgo de exclusión socio-laboral o diversidad funcional.
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

export default TerminosCondiciones;
