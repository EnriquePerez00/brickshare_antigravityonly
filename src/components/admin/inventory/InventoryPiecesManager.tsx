import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer } from "lucide-react";

const InventoryPiecesManager = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Hammer className="h-5 w-5" />
                    Gestión de Inventario de Piezas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Hammer className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Próximamente</p>
                    <p>Esta sección para gestionar piezas individuales está en construcción.</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default InventoryPiecesManager;
