import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem("cookie-consent", "all");
        setIsVisible(false);
    };

    const acceptNecessary = () => {
        localStorage.setItem("cookie-consent", "necessary");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="container mx-auto max-w-7xl">
                        <div className="bg-card border shadow-xl rounded-2xl p-6 md:p-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 rounded-full bg-primary/10 text-primary">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-foreground">Aviso de Cookies</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y
                                            personalizar el contenido según tus preferencias. Puedes aceptar todas las cookies o configurar tus preferencias.
                                            Para más información, consulta nuestra {" "}
                                            <Link to="/cookies" className="text-primary hover:underline font-medium">
                                                Política de Cookies
                                            </Link>.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <Button variant="outline" onClick={acceptNecessary} className="w-full sm:w-auto">
                                        Solo necesarias
                                    </Button>
                                    <Button onClick={acceptAll} className="w-full sm:w-auto gradient-hero">
                                        Aceptar todas
                                    </Button>
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground md:hidden"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
