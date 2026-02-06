import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Package, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
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

const InventoryManager = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingInventory, setEditingInventory] = useState<any>(null); // Re-added state for edit dialog if needed later, though currently using just for delete in list.
  // Actually re-reading the code in previous turn, `handleEdit` was there but removed in my specific view? 
  // Wait, I refactored it heavily in step 126 and might have removed handleEdit/deleteMutation but left the calls?
  // Ah, I replaced the whole file content in step 132 basically.
  // Let's re-add the missing pieces: deleteMutation and handleEdit (if I want edit dialog back).
  // The user asked for "edit and delete icons", so I should re-enable editing logic if it was lost or add it if missing.

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin-inventory-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_sets")
        .select(`
          *,
          sets (
            id,
            set_name,
            set_theme,
            set_ref
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_sets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-sets"] });
      toast.success("Inventario eliminado correctamente");
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error("Error al eliminar inventario: " + error.message);
      setItemToDelete(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const { id, ...updateData } = values;
      const { error } = await supabase
        .from("inventory_sets")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-sets"] });
      toast.success("Inventario actualizado correctamente");
      setIsDialogOpen(false);
      setEditingInventory(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar inventario: " + error.message);
    },
  });

  const handleEdit = (item: any) => {
    setEditingInventory({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingInventory) return;

    const { id, inventory_set_total_qty, en_envio, en_uso, en_devolucion, en_reparacion } = editingInventory;

    updateMutation.mutate({
      id,
      inventory_set_total_qty: parseInt(inventory_set_total_qty),
      en_envio: parseInt(en_envio),
      en_uso: parseInt(en_uso),
      en_devolucion: parseInt(en_devolucion),
      en_reparacion: parseInt(en_reparacion),
    });
  };

  // Re-adding handleEdit properly requires state.


  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fetch all sets to map set_ref to set_id
    const { data: allSets, error: setsError } = await supabase
      .from("sets")
      .select("id, set_ref");

    if (setsError) {
      toast.error("Error al obtener referencias de LEGO: " + setsError.message);
      return;
    }

    const refToIdMap = new Map(allSets.map(s => [s.set_ref, s.id]));

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        if (data.length === 0) {
          toast.error("El archivo CSV está vacío");
          return;
        }

        const refs = [...new Set(data.map((row: any) => row.REF).filter(Boolean))];
        if (refs.length > 0) {
          const { data: existingPieces, error: checkError } = await supabase
            .from("set_piece_list" as any)
            .select("set_ref")
            .in("set_ref", refs);

          if (checkError) {
            toast.error("Error verificando duplicados: " + checkError.message);
            return;
          }

          if (existingPieces && existingPieces.length > 0) {
            // Correctly cast existingPieces to extract set_ref if types are missing
            const existingRefs = [...new Set(existingPieces.map((p: any) => p.set_ref))].join(", ");
            toast.error(`Inventario ya en la bb.dd para: ${existingRefs}`);
            return;
          }
        }

        const piecesToInsert = data.map((row) => {
          const setId = refToIdMap.get(row.REF);
          if (!setId) {
            console.warn(`Referencia LEGO no encontrada: ${row.REF}`);
            return null;
          }
          return {
            set_id: setId,
            set_ref: row.REF,
            piece_ref: row.piece_ref,
            color_ref: row.bricklink_color,
            piece_description: row.piece_description,
            piece_qty: parseInt(row.rebrickable_qty) || 0,
            piece_image_url: row.bricklink_image_piece_url,
            piece_weight: parseFloat(row["bricklink_piece_weight(gr)"]?.replace(",", ".")) || 0,
            piece_studdim: row.bricklink_piece_studdim,
            piece_lego_elementid: row.element_id,
            bricklink_color_id: row.bricklink_color_id,
          };
        }).filter(Boolean);

        if (piecesToInsert.length === 0) {
          toast.error("No se encontraron sets válidos en el CSV para importar piezas");
          return;
        }

        try {
          // First, delete existing pieces for these sets to avoid duplicates (optional but safer for "upload" action?) 
          // The user didn't specify "replace" or "append", but "upload inventory" often implies setting the state. 
          // However, bulk delete might be dangerous. Let's just insert for now.
          // Actually, usually BOM upload happens once per set.

          const { error } = await supabase.from("set_piece_list" as any).insert(piecesToInsert as any);
          if (error) throw error;
          toast.success(`${piecesToInsert.length} piezas importadas correctamente`);
        } catch (error: any) {
          toast.error("Error al importar piezas: " + error.message);
        }
      },
      error: (error) => {
        toast.error("Error al leer el archivo CSV: " + error.message);
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStockStatus = (total: number) => {
    if (total === 0) return { label: "Sin Stock", variant: "destructive" as const };
    if (total < 5) return { label: "Stock bajo", variant: "secondary" as const };
    return { label: "Con Stock", variant: "default" as const };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventory Management</CardTitle>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleCSVUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Inventory (CSV)
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : inventory?.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No inventory records. Upload a CSV to add stock!
            </p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Set (Ref)</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Envío</TableHead>
                  <TableHead className="text-center">En uso</TableHead>
                  <TableHead className="text-center">Devolución</TableHead>
                  <TableHead className="text-center">Reparación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory?.map((item) => {
                  const status = getStockStatus(
                    item.inventory_set_total_qty
                  );
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.sets?.set_name} ({item.sets?.set_ref})
                      </TableCell>
                      <TableCell className="text-center">
                        {item.inventory_set_total_qty}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.en_envio}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.en_uso}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.en_devolucion}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.en_reparacion}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setItemToDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Inventario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">Total</Label>
              <Input
                id="total"
                type="number"
                className="col-span-3"
                value={editingInventory?.inventory_set_total_qty || 0}
                onChange={(e) => setEditingInventory({ ...editingInventory, inventory_set_total_qty: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="envio" className="text-right">Envío</Label>
              <Input
                id="envio"
                type="number"
                className="col-span-3"
                value={editingInventory?.en_envio || 0}
                onChange={(e) => setEditingInventory({ ...editingInventory, en_envio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="uso" className="text-right">En uso</Label>
              <Input
                id="uso"
                type="number"
                className="col-span-3"
                value={editingInventory?.en_uso || 0}
                onChange={(e) => setEditingInventory({ ...editingInventory, en_uso: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="devolucion" className="text-right">Devolución</Label>
              <Input
                id="devolucion"
                type="number"
                className="col-span-3"
                value={editingInventory?.en_devolucion || 0}
                onChange={(e) => setEditingInventory({ ...editingInventory, en_devolucion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reparacion" className="text-right">Reparación</Label>
              <Input
                id="reparacion"
                type="number"
                className="col-span-3"
                value={editingInventory?.en_reparacion || 0}
                onChange={(e) => setEditingInventory({ ...editingInventory, en_reparacion: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este registro de inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default InventoryManager;
