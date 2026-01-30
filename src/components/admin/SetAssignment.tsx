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
import { UserPlus, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const SetAssignment = () => {
    const queryClient = useQueryClient();

    const { data: inventory, isLoading } = useQuery({
        queryKey: ["admin-set-assignment-inventory"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inventory_sets")
                .select(`
          *,
          sets (
            set_name,
            set_ref
          )
        `)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.rpc("assign_sets_to_users");
            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            const assignedCount = data?.length || 0;
            if (assignedCount > 0) {
                toast.success(`¡Éxito! Se han asignado ${assignedCount} sets a usuarios.`);
            } else {
                toast.info("No se encontraron asignaciones pendientes posibles (sin stock o sin wishlists).");
            }
            queryClient.invalidateQueries({ queryKey: ["admin-set-assignment-inventory"] });
            queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
        },
        onError: (error) => {
            toast.error("Error al asignar sets: " + error.message);
        },
    });

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
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : inventory?.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No hay sets en el inventario detallado.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Set (Ref)</TableHead>
                                        <TableHead className="text-center">Total</TableHead>
                                        <TableHead className="text-center">En Envío</TableHead>
                                        <TableHead className="text-center">En Uso</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.sets?.set_name} ({item.set_ref})
                                            </TableCell>
                                            <TableCell className="text-center">{item.inventory_set_total_qty}</TableCell>
                                            <TableCell className="text-center">{item.en_envio}</TableCell>
                                            <TableCell className="text-center">{item.en_uso}</TableCell>
                                            <TableCell className="text-center">
                                                {item.inventory_set_total_qty > 0 ? (
                                                    <Badge variant="default">Disponible</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Sin Stock</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SetAssignment;
