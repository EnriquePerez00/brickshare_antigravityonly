import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, RefreshCw, Trash2, Package2 } from "lucide-react";
import { toast } from "sonner";

interface AssignedEnvio {
    envio_id: string;
    user_id: string;
    set_id: string;
    order_id: string;
    user_name: string;
    set_name: string;
    set_ref: string;
    created_at: string;
}

const SetAssignment = () => {
    const queryClient = useQueryClient();
    const [assignedEnvios, setAssignedEnvios] = useState<AssignedEnvio[]>([]);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [envioToDelete, setEnvioToDelete] = useState<string | null>(null);

    const assignMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.rpc("assign_sets_to_users");
            if (error) throw error;
            return data as AssignedEnvio[];
        },
        onSuccess: (data: AssignedEnvio[]) => {
            const assignedCount = data?.length || 0;
            if (assignedCount > 0) {
                setAssignedEnvios(data);
                toast.success(`¡Éxito! Se han asignado ${assignedCount} sets a usuarios.`);
            } else {
                toast.info("No se encontraron asignaciones pendientes posibles (sin stock o sin wishlists).");
            }
            queryClient.invalidateQueries({ queryKey: ["admin-set-assignment-inventory"] });
            queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
        },
        onError: (error: Error) => {
            toast.error("Error al asignar sets: " + error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (envioId: string) => {
            const { error } = await supabase.rpc("delete_assignment_and_rollback", {
                p_envio_id: envioId,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Asignación eliminada correctamente");
            if (envioToDelete) {
                setAssignedEnvios((prev) => prev.filter((e) => e.envio_id !== envioToDelete));
            }
            queryClient.invalidateQueries({ queryKey: ["admin-set-assignment-inventory"] });
            queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
        },
        onError: (error: Error) => {
            toast.error("Error al eliminar asignación: " + error.message);
        },
    });

    const handleDeleteClick = (envioId: string) => {
        setEnvioToDelete(envioId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (envioToDelete) {
            deleteMutation.mutate(envioToDelete);
        }
        setDeleteConfirmOpen(false);
        setEnvioToDelete(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Asignación Automática de Sets</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Asigna sets aleatoriamente basándose en las wishlists de los usuarios y el stock disponible.
                        </p>
                    </div>
                    <Button
                        onClick={() => assignMutation.mutate()}
                        disabled={assignMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {assignMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Asigna sets a usuarios
                    </Button>
                </CardHeader>
                <CardContent>
                    {assignedEnvios.length === 0 ? (
                        <div className="text-center py-12">
                            <Package2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                No hay asignaciones mostradas. Haz clic en "Asigna sets a usuarios" para ver los resultados.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Set (Ref)</TableHead>
                                        <TableHead>ID Pedido</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedEnvios.map((envio) => (
                                        <TableRow key={envio.envio_id}>
                                            <TableCell className="font-medium">
                                                {envio.user_name}
                                            </TableCell>
                                            <TableCell>
                                                {envio.set_name} ({envio.set_ref})
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {envio.order_id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                {new Date(envio.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(envio.envio_id)}
                                                    disabled={deleteMutation.isPending}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar asignación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el envío, el pedido asociado y devolverá el set al inventario.
                            El estado del usuario se actualizará a "sin set".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SetAssignment;
