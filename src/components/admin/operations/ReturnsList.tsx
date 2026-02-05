import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, AlertCircle, ClipboardList } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ReturnItem {
    id: string; // envio uuid
    user_id: string;
    set_id: string; // we need set_id to update status
    created_at: string;
    estado_envio: string;
    users: {
        full_name: string | null;
        email: string | null;
    };
    sets: { // Joining sets
        id: string;
        set_ref: string | null; // set_ref
        set_name: string;
        set_weight: number | null; // Changed from set_status to set_weight
        set_status: string | null; // Keeping status for internal logic if needed
    } | null; // It might be null if left join fails, but shouldn't
}

const ReturnsList = () => {
    const [returns, setReturns] = useState<ReturnItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ReturnItem | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth(); // Ensure auth context is ready

    const fetchReturns = async () => {
        setIsLoading(true);
        try {
            // Fetch envios with status 'devuelto'
            const { data, error } = await supabase
                .from("envios")
                .select(`
                    id,
                    user_id,
                    created_at,
                    estado_envio,
                    set_id,
                    users (
                        full_name,
                        email
                    ),
                    sets (
                        id,
                        set_ref,
                        set_name,
                        set_weight,
                        set_status
                    )
                `)
                .eq("estado_envio", "devuelto") // Filtering by returned shipments
                .eq("estado_manipulacion", false) // Show only unprocessed returns
                .order("created_at", { ascending: false });

            if (error) throw error;

            console.log("Returns fetched:", data);
            setReturns(data as any); // Type casting for simplicity here
        } catch (error: any) {
            console.error("Error fetching returns:", error);
            toast({
                title: "Error al cargar devoluciones",
                description: `Error: ${error.message || error.code || JSON.stringify(error)}`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
        console.log("ReturnsList mounted - Checking devuelto");
    }, []);

    const handleEditClick = (item: ReturnItem) => {
        setSelectedItem(item);
        setNewStatus(item.sets?.set_status || "inactivo");
        setIsDialogOpen(true);
    };

    const handleConfirmUpdate = async () => {
        if (!selectedItem || !selectedItem.sets) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase.rpc("update_set_status_from_return", {
                p_set_id: selectedItem.sets.id,
                p_new_status: newStatus,
                p_envio_id: selectedItem.id
            });

            if (error) throw error;

            toast({
                title: "Estado actualizado",
                description: `El set ha pasado a estado "${newStatus}".`,
                className: "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800",
            });

            // Refresh list
            await fetchReturns();
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: error.message || "No se pudo actualizar el estado.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "activo": return "default"; // green-ish usually or default primary
            case "inactivo": return "secondary"; // gray
            case "en reparacion": return "destructive"; // red/orange or maybe we want a warning color?
            default: return "outline";
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (returns.length === 0) {
        return (
            <div className="text-center p-8 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No hay devoluciones pendientes</h3>
                <p className="text-muted-foreground">No se encontraron envíos en estado 'devuelto'.</p>
                {/* Debug hint */}
                <Button variant="ghost" size="sm" onClick={fetchReturns} className="mt-4">
                    Refrescar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Set Ref</TableHead>
                            <TableHead>Peso Referencia</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {returns.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.users?.full_name || "Sin nombre"}</span>
                                        <span className="text-xs text-muted-foreground">{item.users?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold bg-muted px-2 py-1 rounded">
                                            {item.sets?.set_ref || "N/A"}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                            {item.sets?.set_name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-mono text-sm">
                                        <span>{item.sets?.set_weight ? `${item.sets.set_weight}g` : "N/A"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditClick(item)}
                                        title="Editar estado del set"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Actualizar Estado del Set</DialogTitle>
                        <DialogDescription>
                            Cambia el estado del set <strong>{selectedItem?.sets?.set_ref}</strong>.
                            Esta acción actualizará el inventario automáticamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Situacion test
                            </label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona resultado del test" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activo">Peso OK (Mover a Stock)</SelectItem>
                                    <SelectItem value="en reparacion">Faltan Piezas (Mover a Reparación)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newStatus === "en reparacion" && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 flex gap-3 text-amber-800 dark:text-amber-200 text-sm">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p>
                                    Se marcará como "En Reparación" (+1 Ud).
                                </p>
                            </div>
                        )}

                        {newStatus === "activo" && (
                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 flex gap-3 text-blue-800 dark:text-blue-200 text-sm">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p>
                                    Se marcará como "Activo/Stock".
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUpdating}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmUpdate} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Cambio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReturnsList;
