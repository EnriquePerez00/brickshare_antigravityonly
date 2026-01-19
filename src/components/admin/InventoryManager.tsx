import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Package } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const inventorySchema = z.object({
  set_id: z.string().min(1, "Set is required"),
  total_stock: z.coerce.number().min(0, "Total stock must be 0 or more"),
  available_stock: z.coerce.number().min(0, "Available stock must be 0 or more"),
  shipping_count: z.coerce.number().min(0, "Shipping count must be 0 or more"),
  being_used_count: z.coerce.number().min(0, "In use count must be 0 or more"),
  returning_count: z.coerce.number().min(0, "Returning count must be 0 or more"),
  being_completed_count: z.coerce.number().min(0, "Completing count must be 0 or more"),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

const InventoryManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any>(null);
  const queryClient = useQueryClient();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      set_id: "",
      total_stock: 0,
      available_stock: 0,
      shipping_count: 0,
      being_used_count: 0,
      returning_count: 0,
      being_completed_count: 0,
    },
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          sets (
            id,
            name,
            theme
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: sets } = useQuery({
    queryKey: ["admin-sets-for-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sets")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Get sets that don't have inventory yet
  const availableSets = sets?.filter(
    (s) => !inventory?.some((i) => i.set_id === s.id) || editingInventory?.set_id === s.id
  );

  const createMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const { error } = await supabase.from("inventory").insert({
        set_id: data.set_id,
        total_stock: data.total_stock,
        available_stock: data.available_stock,
        shipping_count: data.shipping_count,
        being_used_count: data.being_used_count,
        returning_count: data.returning_count,
        being_completed_count: data.being_completed_count,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      toast.success("Inventory created successfully");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create inventory: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InventoryFormData }) => {
      const { error } = await supabase
        .from("inventory")
        .update({
          total_stock: data.total_stock,
          available_stock: data.available_stock,
          shipping_count: data.shipping_count,
          being_used_count: data.being_used_count,
          returning_count: data.returning_count,
          being_completed_count: data.being_completed_count,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      toast.success("Inventory updated successfully");
      setIsDialogOpen(false);
      setEditingInventory(null);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to update inventory: " + error.message);
    },
  });

  const handleEdit = (item: any) => {
    setEditingInventory(item);
    form.reset({
      set_id: item.set_id,
      total_stock: item.total_stock,
      available_stock: item.available_stock,
      shipping_count: item.shipping_count,
      being_used_count: item.being_used_count,
      returning_count: item.returning_count,
      being_completed_count: item.being_completed_count,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: InventoryFormData) => {
    if (editingInventory) {
      updateMutation.mutate({ id: editingInventory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingInventory(null);
    form.reset();
  };

  const getStockStatus = (available: number, total: number) => {
    const ratio = total > 0 ? available / total : 0;
    if (ratio === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (ratio < 0.3) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventory Management</CardTitle>
        <Button
          onClick={() => {
            setEditingInventory(null);
            form.reset();
            setIsDialogOpen(true);
          }}
          disabled={!availableSets?.length && !editingInventory}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory
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
            <p className="text-muted-foreground">
              No inventory records. Add stock for your sets!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Set</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Shipping</TableHead>
                  <TableHead className="text-center">In Use</TableHead>
                  <TableHead className="text-center">Returning</TableHead>
                  <TableHead className="text-center">Completing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory?.map((item) => {
                  const status = getStockStatus(
                    item.available_stock,
                    item.total_stock
                  );
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.sets?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.total_stock}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.available_stock}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.shipping_count}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.being_used_count}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.returning_count}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.being_completed_count}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInventory ? "Edit Inventory" : "Add Inventory"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="set_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Set</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!editingInventory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a set" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(editingInventory ? sets : availableSets)?.map(
                            (set) => (
                              <SelectItem key={set.id} value={set.id}>
                                {set.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="total_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="available_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shipping_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="being_used_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>In Use</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="returning_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Returning</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="being_completed_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completing</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {editingInventory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InventoryManager;
