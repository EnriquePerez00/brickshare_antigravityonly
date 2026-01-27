import { useShipments } from "@/hooks/useShipments";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package } from "lucide-react";

const ShipmentsList = () => {
    const { data: shipments, isLoading } = useShipments();

    // Filter only shipments that are NOT returns (or just show all with status filtering if preferred)
    // For now, let's show all shipments in this section but maybe filtered by relevant statuses
    const activeShipments = shipments?.filter(s =>
        ['pendiente', 'asignado', 'en_transito', 'entregado'].includes(s.estado_envio)
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
        } catch (e) {
            return "-";
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>set_num</TableHead>
                        <TableHead>fecha_asignacion</TableHead>
                        <TableHead>fecha_recogida_al</TableHead>
                        <TableHead>proveedor_envio</TableHead>
                        <TableHead>fecha_entrega_us</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activeShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                            <TableCell className="font-medium">
                                {shipment.orders?.sets?.lego_ref || "-"}
                            </TableCell>
                            <TableCell>
                                {formatDate(shipment.fecha_asignada)}
                            </TableCell>
                            <TableCell>
                                {formatDate(shipment.fecha_recogida_almacen)}
                            </TableCell>
                            <TableCell>
                                {shipment.proveedor_envio || "-"}
                            </TableCell>
                            <TableCell>
                                {formatDate(shipment.fecha_entrega_usuario)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ShipmentsList;
