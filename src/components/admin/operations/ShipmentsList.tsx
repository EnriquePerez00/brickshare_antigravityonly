import { useShipments } from "@/hooks/useShipments";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, FileText, Loader2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const ShipmentsList = () => {
    const { data: shipments, isLoading, refetch } = useShipments();
    const { toast } = useToast();
    const [processing, setProcessing] = useState<string | null>(null);

    // Filter active shipments and sort by updated_at DESC (most recent first)
    const activeShipments = shipments
        ?.filter(s =>
            ['preparacion', 'ruta_envio', 'devuelto', 'ruta_devolucion', 'pendiente', 'asignado'].includes(s.estado_envio)
        )
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const handleLogisticsAction = async (envioId: string, action: 'preregister' | 'get_label') => {
        setProcessing(`${envioId}-${action}`);
        try {
            const { data, error } = await supabase.functions.invoke('correos-logistics', {
                body: { action, p_envios_id: envioId }
            });

            if (error) throw error;

            toast({
                title: action === 'preregister' ? "Envío Registrado" : "Etiqueta Generada",
                description: data.message,
                className: "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800",
            });
            refetch();
        } catch (error: any) {
            console.error(`Error in ${action}:`, error);
            toast({
                title: "Error",
                description: error.message || "No se pudo completar la acción.",
                variant: "destructive",
            });
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'pendiente':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Pendiente</Badge>;
            case 'asignado':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Asignado</Badge>;
            case 'preparacion':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En Preparación</Badge>;
            case 'ruta_envio':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">En Camino</Badge>;
            case 'devuelto':
                return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Devolución Solicitada</Badge>;
            case 'ruta_devolucion':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">En Devolución</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded"></div>)}
        </div>;
    }

    if (!activeShipments || activeShipments.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No hay envíos activos registrados.</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Set Ref</TableHead>
                            <TableHead>Estado Envío</TableHead>
                            <TableHead>Dirección Envío</TableHead>
                            <TableHead className="text-right">Acciones Correos</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeShipments.map((shipment) => (
                            <TableRow key={shipment.id}>
                                <TableCell className="font-medium">
                                    {shipment.users?.email || "-"}
                                </TableCell>
                                <TableCell>
                                    {shipment.set_ref || "-"}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(shipment.estado_envio)}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {shipment.direccion_envio}
                                        <div className="text-xs text-muted-foreground">
                                            {shipment.codigo_postal_envio} {shipment.ciudad_envio}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {!shipment.correos_shipment_id ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleLogisticsAction(shipment.id, 'preregister')}
                                                disabled={!!processing}
                                                className="gap-2"
                                            >
                                                {processing === `${shipment.id}-preregister` ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : <ClipboardCheck className="h-3 w-3" />}
                                                Prerregistro
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (shipment.label_url) {
                                                            window.open(shipment.label_url, '_blank');
                                                        } else {
                                                            handleLogisticsAction(shipment.id, 'get_label');
                                                        }
                                                    }}
                                                    disabled={!!processing}
                                                    className="gap-2"
                                                >
                                                    {processing === `${shipment.id}-get_label` ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : <FileText className="h-3 w-3" />}
                                                    {shipment.label_url ? 'Ver Etiqueta' : 'Generar Etiqueta'}
                                                </Button>
                                                {shipment.correos_shipment_id && (
                                                    <div className="text-[10px] text-muted-foreground mt-1">
                                                        ID: {shipment.correos_shipment_id}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ShipmentsList;
