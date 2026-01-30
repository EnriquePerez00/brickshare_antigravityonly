import { useShipments } from "@/hooks/useShipments";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";

const ShipmentsList = () => {
    const { data: shipments, isLoading } = useShipments();

    // Filter shipments by allowed estados and sort by updated_at DESC (most recent first)
    const activeShipments = shipments
        ?.filter(s =>
            ['preparado_envio', 'enviado', 'preparado_devolucion', 'devuelto'].includes(s.estado_envio)
        )
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado Envío</TableHead>
                        <TableHead>Dirección Envío</TableHead>
                        <TableHead>Set Ref</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activeShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                            <TableCell className="font-medium">
                                {shipment.order_id?.substring(0, 8) || "-"}
                            </TableCell>
                            <TableCell>
                                {shipment.users?.email || "-"}
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${shipment.estado_envio === 'enviado' ? 'bg-blue-100 text-blue-800' :
                                    shipment.estado_envio === 'preparado_envio' ? 'bg-yellow-100 text-yellow-800' :
                                        shipment.estado_envio === 'devuelto' ? 'bg-green-100 text-green-800' :
                                            shipment.estado_envio === 'preparado_devolucion' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {shipment.estado_envio || "-"}
                                </span>
                            </TableCell>
                            <TableCell>
                                {shipment.direccion_envio || "-"}
                            </TableCell>
                            <TableCell>
                                {shipment.set_ref || shipment.orders?.sets?.set_ref || "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ShipmentsList;
