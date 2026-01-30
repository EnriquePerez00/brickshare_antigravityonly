import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Component to manage and view missing LEGO parts reported during set reception.
 * Fetches data from 'operaciones_recepcion' where 'missing_parts' is not null.
 */
const PiecePurchaseManager = () => {
    const { data: missingPartsRequests, isLoading } = useQuery({
        queryKey: ["admin-missing-parts"],
        queryFn: async () => {
            // Fetch records where missing_parts is not null or empty string
            const { data, error } = await supabase
                .from("operaciones_recepcion")
                .select(`
          id,
          missing_parts,
          created_at,
          sets (
            set_name,
            set_ref
          ),
          users:user_id (
            full_name
          )
        `)
                .not("missing_parts", "is", null)
                .neq("missing_parts", "")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Piezas por Comprar
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!missingPartsRequests || missingPartsRequests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No hay reportes de piezas faltantes actualmente.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Set (Ref)</TableHead>
                                    <TableHead>Usuario que devolvió</TableHead>
                                    <TableHead>Piezas faltantes</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {missingPartsRequests.map((request: any) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {request.sets?.set_name} ({request.sets?.set_ref})
                                        </TableCell>
                                        <TableCell>
                                            {request.users?.full_name || "Desconocido"}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="text-sm italic text-muted-foreground break-words">
                                                "{request.missing_parts}"
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                                                Pendiente
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PiecePurchaseManager;
