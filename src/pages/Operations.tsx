import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, ClipboardList, Boxes, Settings } from "lucide-react";
import InventoryManager from "@/components/admin/InventoryManager";
import ShipmentsList from "@/components/admin/ShipmentsList";
import ReturnsList from "@/components/admin/ReturnsList";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Operations = () => {
    const { user, isOperador, isAdmin, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && (!user || (!isOperador && !isAdmin))) {
            navigate("/");
        }
    }, [user, isOperador, isAdmin, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || (!isOperador && !isAdmin)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-8 mt-16 flex-grow">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Panel de Operaciones</h1>
                    <p className="text-muted-foreground mt-2">
                        Gestión logística, envíos, devoluciones y mantenimiento de sets.
                    </p>
                </div>

                <Tabs defaultValue="inventory" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                        <TabsTrigger value="inventory" className="flex items-center gap-2">
                            <Boxes className="h-4 w-4" />
                            Inventario
                        </TabsTrigger>
                        <TabsTrigger value="shipments" className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Envíos
                        </TabsTrigger>
                        <TabsTrigger value="returns" className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Devoluciones
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Mantenimiento
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inventory" className="space-y-4">
                        <InventoryManager />
                    </TabsContent>

                    <TabsContent value="shipments">
                        <ShipmentsList />
                    </TabsContent>

                    <TabsContent value="returns">
                        <ReturnsList />
                    </TabsContent>

                    <TabsContent value="maintenance">
                        <div className="bg-card p-8 rounded-xl border border-border text-center">
                            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Taller de Mantenimiento</h3>
                            <p className="text-muted-foreground">Próximamente: Registro de higienización y conteo de piezas.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <Footer />
        </div>
    );
};

export default Operations;
