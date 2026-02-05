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
import { Package } from "lucide-react";

const ShipmentsList = () => {
    const { data: shipments, isLoading } = useShipments();

    // Filter active shipments and sort by updated_at DESC (most recent first)
    const activeShipments = shipments
        ?.filter(s =>
            ['preparacion', 'ruta_envio', 'devuelto', 'ruta_devolucion'].includes(s.estado_envio)
        )
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const getStatusBadge = (estado: string) => {
        switch (estado) {
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
                            <TableHead>Última Actualización</TableHead>
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
                                    {shipment.direccion_envio || "-"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(shipment.updated_at).toLocaleDateString()}
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
