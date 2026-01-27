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
import { ClipboardList } from "lucide-react";

const ReturnsList = () => {
    const { data: allData, isLoading } = useShipments();

    // Filter only those in return process or with return-related fields populated
    const returns = allData?.filter(s =>
        ['devuelto', 'en_transito_retorno'].includes(s.estado_envio) ||
        s.fecha_solicitud_devolucion !== null
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

    if (!returns || returns.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No hay devoluciones registradas o en proceso.</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID_usuario</TableHead>
                        <TableHead>set_num</TableHead>
                        <TableHead>fecha_asignacio</TableHead>
                        <TableHead>fecha_recogida_al</TableHead>
                        <TableHead>proveedor_envio</TableHead>
                        <TableHead>fecha_entrega_u</TableHead>
                        <TableHead>fecha_solicitud_devoluc</TableHead>
                        <TableHead>proveedor_recogida</TableHead>
                        <TableHead>fecha_entrega_usuario</TableHead>
                        <TableHead>fecha_recepcion_almac</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {returns.map((shipment) => (
                        <TableRow key={shipment.id}>
                            <TableCell className="font-medium text-xs truncate max-w-[100px]" title={shipment.profiles?.full_name || shipment.user_id}>
                                {shipment.profiles?.full_name || shipment.user_id.substring(0, 8)}
                            </TableCell>
                            <TableCell>
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
                                {formatDate(shipment.fecha_entrega_real)}
                            </TableCell>
                            <TableCell>
                                {formatDate(shipment.fecha_solicitud_devolucion)}
                            </TableCell>
                            <TableCell>
                                {shipment.proveedor_recogida || "-"}
                            </TableCell>
                            <TableCell>
                                {formatDate(shipment.fecha_entrega_usuario)}
                            </TableCell>
                            <TableCell>
                                {formatDate(shipment.fecha_recepcion_almacen)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ReturnsList;
