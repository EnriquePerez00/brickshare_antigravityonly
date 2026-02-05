
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface InventorySet {
    id: string; // inventory id
    set_id: string;
    set_ref: string;
    en_reparacion: number;
    // stock_central dropped in Jan 27 refactor
    updated_at: string;
    spare_parts_order: string | null;
}

const MaintenanceList = () => {
    const queryClient = useQueryClient();

    const { data: repairingSets, isLoading } = useQuery({
        queryKey: ['maintenance-sets'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory_sets')
                .select('*')
                .gt('en_reparacion', 0);

            if (error) throw error;
            return data as InventorySet[];
        }
    });

    const handleComplete = async (item: InventorySet) => {
        try {
            // Move items from repair back to central stock (implicit by clearing en_reparacion)
            const { error } = await supabase
                .from('inventory_sets')
                .update({
                    en_reparacion: 0
                })
                .eq('id', item.id);

            if (error) throw error;

            toast.success(`Mantenimiento completado para set ${item.set_ref}`);
            queryClient.invalidateQueries({ queryKey: ['maintenance-sets'] });
        } catch (error) {
            console.error("Error completing maintenance:", error);
            toast.error("Error al completar el mantenimiento");
        }
    };

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded"></div>)}
        </div>;
    }

    if (!repairingSets || repairingSets.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No hay sets en mantenimiento actualmente.</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                            <TableHead>Set Ref</TableHead>
                            <TableHead>Pedido Piezas</TableHead>
                            <TableHead>Desde</TableHead>
                            <TableHead>Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {repairingSets.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.set_ref || "N/A"}
                                </TableCell>
                                <TableCell>
                                    {item.spare_parts_order ? (
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                            {item.spare_parts_order}
                                        </span>
                                    ) : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(item.updated_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        className="h-8 gap-2 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleComplete(item)}
                                    >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Completar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default MaintenanceList;
