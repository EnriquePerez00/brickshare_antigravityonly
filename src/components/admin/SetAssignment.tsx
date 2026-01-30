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
import { Eye, CheckCircle, XCircle, Trash2, Package2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PreviewAssignment {
    user_id: string;
    user_name: string;
    set_id: string;
    set_name: string;
    set_ref: string;
    current_stock: number;
}

interface ConfirmedEnvio {
    envio_id: string;
    user_id: string;
    set_id: string;
    order_id: string;
    user_name: string;
    set_name: string;
    set_ref: string;
    created_at: string;
}

type ViewMode = "initial" | "preview" | "confirmed";

const SetAssignment = () => {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<ViewMode>("initial");
    const [previewAssignments, setPreviewAssignments] = useState<PreviewAssignment[]>([]);
    const [confirmedEnvios, setConfirmedEnvios] = useState<ConfirmedEnvio[]>([]);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [envioToDelete, setEnvioToDelete] = useState<string | null>(null);

    // Preview mutation - shows proposal without making changes
    const previewMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.rpc("preview_assign_sets_to_users");
            if (error) throw error;
            return data as PreviewAssignment[];
        },
        onSuccess: (data: PreviewAssignment[]) => {
            if (data.length > 0) {
                setPreviewAssignments(data);
                setViewMode("preview");
                toast.success(`Se encontraron ${data.length} asignaciones posibles`);
            } else {
                toast.info("No se encontraron asignaciones posibles (sin usuarios elegibles o sin stock)");
            }
        },
        onError: (error: Error) => {
            toast.error("Error al generar propuesta: " + error.message);
        },
    });

    // Confirm mutation - executes the assignments
    const confirmMutation = useMutation({
        mutationFn: async (userIds: string[]) => {
            const { data, error } = await supabase.rpc("confirm_assign_sets_to_users", {
                p_user_ids: userIds,
            });
            if (error) throw error;
            return data as ConfirmedEnvio[];
        },
        onSuccess: (data: ConfirmedEnvio[]) => {
            setConfirmedEnvios(data);
            setViewMode("confirmed");
            setPreviewAssignments([]);
            toast.success(`¡Éxito! Se han confirmado ${data.length} asignaciones`);
            queryClient.invalidateQueries({ queryKey: ["admin-set-assignment-inventory"] });
            queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
        },
        onError: (error: Error) => {
            toast.error("Error al confirmar asignaciones: " + error.message);
        },
    });

    // Delete mutation - removes confirmed assignment with rollback
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
                setConfirmedEnvios((prev) => prev.filter((e) => e.envio_id !== envioToDelete));
            }
            queryClient.invalidateQueries({ queryKey: ["admin-set-assignment-inventory"] });
            queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
        },
        onError: (error: Error) => {
            toast.error("Error al eliminar asignación: " + error.message);
        },
    });

    const handleGenerateProposal = () => {
        setConfirmedEnvios([]);
        previewMutation.mutate();
    };

    const handleConfirmAssignments = () => {
        const userIds = previewAssignments.map((a) => a.user_id);
        confirmMutation.mutate(userIds);
    };

    const handleCancelPreview = () => {
        setPreviewAssignments([]);
        setViewMode("initial");
        toast.info("Propuesta cancelada");
    };

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
                            {viewMode === "initial" && "Genera una propuesta de asignaciones basada en wishlists y stock disponible"}
                            {viewMode === "preview" && "Revisa la propuesta y confírmala o cancélala"}
                            {viewMode === "confirmed" && "Asignaciones confirmadas - puedes eliminar aquí si es necesario"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {viewMode === "initial" && (
                            <Button
                                onClick={handleGenerateProposal}
                                disabled={previewMutation.isPending}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {previewMutation.isPending ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Eye className="h-4 w-4 mr-2" />
                                )}
                                Genera propuesta de asignación
                            </Button>
                        )}
                        {viewMode === "preview" && (
                            <>
                                <Button
                                    onClick={handleCancelPreview}
                                    variant="outline"
                                    disabled={confirmMutation.isPending}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleConfirmAssignments}
                                    disabled={confirmMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {confirmMutation.isPending ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Confirmar asignaciones
                                </Button>
                            </>
                        )}
                        {viewMode === "confirmed" && (
                            <Button
                                onClick={() => setViewMode("initial")}
                                variant="outline"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Nueva propuesta
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {viewMode === "initial" && (
                        <div className="text-center py-12">
                            <Package2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Haz clic en "Genera propuesta de asignación" para ver qué sets se asignarían.
                            </p>
                        </div>
                    )}

                    {viewMode === "preview" && (
                        <div>
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>Vista previa:</strong> Esta es una propuesta. No se han realizado cambios en la base de datos.
                                    Revisa las asignaciones y confirma o cancela.
                                </p>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Set Propuesto (Ref)</TableHead>
                                            <TableHead className="text-center">Stock Actual</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewAssignments.map((assignment) => (
                                            <TableRow key={assignment.user_id}>
                                                <TableCell className="font-medium">
                                                    {assignment.user_name}
                                                </TableCell>
                                                <TableCell>
                                                    {assignment.set_name} ({assignment.set_ref})
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">{assignment.current_stock} disponible</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {viewMode === "confirmed" && (
                        <div>
                            {confirmedEnvios.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No hay asignaciones confirmadas.
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
                                            {confirmedEnvios.map((envio) => (
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
