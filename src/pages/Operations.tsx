import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, ClipboardList, Boxes, Settings, UserPlus } from "lucide-react";
import SetAssignment from "@/components/admin/operations/SetAssignment";
import ShipmentsList from "@/components/admin/operations/ShipmentsList";
import ReturnsList from "@/components/admin/operations/ReturnsList";
import MaintenanceList from "@/components/admin/inventory/MaintenanceList";
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

                <Tabs defaultValue="assignment" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                        <TabsTrigger value="assignment" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Asignación sets
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

                    <TabsContent value="assignment" className="space-y-4">
                        <SetAssignment />
                    </TabsContent>

                    <TabsContent value="shipments">
                        <ShipmentsList />
                    </TabsContent>

                    <TabsContent value="returns">
                        <ReturnsList />
                    </TabsContent>

                    <TabsContent value="maintenance">
                        <div className="bg-card p-4 rounded-xl border border-border">
                            <h3 className="text-xl font-semibold mb-2">Registro de sets en mantenimiento</h3>
                            <p className="text-muted-foreground mb-6">Administra los sets que están siendo reparados o higienizados. Completa el mantenimiento para devolverlos al stock central.</p>
                            <MaintenanceList />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <Footer />
        </div >
    );
};

export default Operations;
