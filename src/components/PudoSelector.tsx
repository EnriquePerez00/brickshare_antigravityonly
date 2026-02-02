import { useState, useEffect, useRef } from "react";
declare global {
    interface Window {
        google: any;
    }
}
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X, Loader2, Info, Building2, Box } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PUDOPoint {
    id_correos_pudo: string;
    nombre: string;
    direccion: string;
    cp: string;
    ciudad: string;
    lat: number;
    lng: number;
    horario: string;
    tipo_punto: "Oficina" | "Citypaq";
}

interface PudoSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (point: PUDOPoint) => void;
    initialZipCode?: string;
    initialAddress?: string;
}

const PudoSelector = ({ isOpen, onClose, onSelect, initialZipCode, initialAddress }: PudoSelectorProps) => {
    const [map, setMap] = useState<any>(null);
    const [points, setPoints] = useState<PUDOPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialAddress || initialZipCode || "");
    const [selectedPoint, setSelectedPoint] = useState<PUDOPoint | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<any[]>([]);

    // Load Google Maps Script
    useEffect(() => {
        if (isOpen && !window.google) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => initMap();
            document.head.appendChild(script);
        } else if (isOpen && window.google) {
            setTimeout(initMap, 100);
        }
    }, [isOpen]);

    const initMap = () => {
        if (!mapRef.current || !window.google) return;

        const defaultCenter = { lat: 40.4168, lng: -3.7038 }; // Madrid
        const newMap = new window.google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 13,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
                }
            ]
        });

        setMap(newMap);

        if (searchQuery) {
            handleSearch(searchQuery, newMap);
        }
    };

    const handleSearch = async (query: string, mapInstance = map) => {
        if (!query || !window.google || !mapInstance) return;

        setLoading(true);
        const geocoder = new window.google.maps.Geocoder();

        // Format query to improve geocoding accuracy for Spanish postal codes
        let searchAddress = query.trim();

        // If it looks like just a postal code (5 digits), add Spain context
        if (/^\d{5}$/.test(searchAddress)) {
            searchAddress = `${searchAddress}, España`;
        } else if (!searchAddress.toLowerCase().includes("españa") && !searchAddress.toLowerCase().includes("spain")) {
            searchAddress = `${searchAddress}, España`;
        }

        geocoder.geocode(
            {
                address: searchAddress,
                region: 'es', // Bias results to Spain
                componentRestrictions: { country: 'ES' } // Restrict to Spain
            },
            async (results, status) => {
                if (status === "OK" && results?.[0]) {
                    const location = results[0].geometry.location;
                    mapInstance.setCenter(location);
                    mapInstance.setZoom(14);

                    await fetchPudoPoints(location.lat(), location.lng());
                } else {
                    console.error("Geocoding error:", status, results);
                    toast.error("No se pudo encontrar la ubicación. Intenta con una dirección más completa.");
                }
                setLoading(false);
            }
        );
    };

    const fetchPudoPoints = async (lat: number, lng: number) => {
        try {
            const { data, error } = await supabase.functions.invoke("correos-pudo", {
                body: { lat, lng, radius: 5000 }
            });

            if (error) throw error;
            setPoints(data || []);
            updateMarkers(data || []);
        } catch (error) {
            console.error("Error fetching PUDO points:", error);
            toast.error("Error al cargar puntos de Correos");
        }
    };

    const updateMarkers = (points: PUDOPoint[]) => {
        if (!map || !window.google) return;

        // Clear old markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        points.forEach(point => {
            const marker = new window.google.maps.Marker({
                position: { lat: point.lat, lng: point.lng },
                map,
                title: point.nombre,
                icon: {
                    url: point.tipo_punto === "Oficina"
                        ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                        : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(32, 32)
                }
            });

            marker.addListener("click", () => {
                setSelectedPoint(point);
            });

            markersRef.current.push(marker);
        });
    };

    const handleConfirm = () => {
        if (selectedPoint) {
            onSelect(selectedPoint);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-background w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-card">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <MapPin className="text-primary" />
                                    Seleccionar Punto de Entrega Correos
                                </h2>
                                <p className="text-sm text-muted-foreground">Oficinas y Citypaq cercanos</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row min-h-0">
                            {/* Sidebar / Info */}
                            <div className="w-full md:w-80 border-r flex flex-col p-4 bg-card overflow-y-auto">
                                <div className="relative mb-4">
                                    <Input
                                        placeholder="Código Postal (ej: 08029)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                                        className="pr-10"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-0 top-0 h-full"
                                        onClick={() => handleSearch(searchQuery)}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-4">
                                    {selectedPoint ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 border rounded-xl bg-accent/20 border-accent"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                {selectedPoint.tipo_punto === "Oficina" ? (
                                                    <Building2 className="h-5 w-5 text-yellow-600" />
                                                ) : (
                                                    <Box className="h-5 w-5 text-blue-600" />
                                                )}
                                                <Badge variant="outline">{selectedPoint.tipo_punto}</Badge>
                                            </div>
                                            <h3 className="font-bold text-foreground mb-1">{selectedPoint.nombre}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">{selectedPoint.direccion}, {selectedPoint.cp}</p>

                                            <div className="space-y-2 mb-4">
                                                <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                    <Info className="h-3 w-3" /> Horario
                                                </p>
                                                <p className="text-sm border-l-2 border-primary/30 pl-2 py-1 bg-primary/5 rounded">
                                                    {selectedPoint.horario}
                                                </p>
                                            </div>

                                            <Button className="w-full" onClick={handleConfirm}>
                                                Seleccionar este punto
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                                            <MapPin className="h-12 w-12 mb-2" />
                                            <p>Selecciona un punto en el mapa para ver los detalles</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map */}
                            <div className="flex-1 relative bg-muted">
                                <div ref={mapRef} className="absolute inset-0" />
                                {!map && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="ml-2">Cargando mapa...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PudoSelector;
