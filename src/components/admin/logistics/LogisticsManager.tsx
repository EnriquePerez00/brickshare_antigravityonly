import ShipmentsList from "@/components/admin/operations/ShipmentsList";

const LogisticsManager = () => {
    return (
        <div className="space-y-6">
            <div className="bg-card p-4 rounded-xl border border-border">
                <h3 className="text-xl font-semibold mb-2">Gestión Logística</h3>
                <p className="text-muted-foreground mb-6">
                    Administra los envíos, genera etiquetas y realiza seguimiento de paquetes.
                </p>
                <ShipmentsList />
            </div>
        </div>
    );
};

export default LogisticsManager;
