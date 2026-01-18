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
  product_id: z.string().min(1, "Product is required"),
  total_stock: z.coerce.number().min(0, "Total stock must be 0 or more"),
  available_stock: z.coerce.number().min(0, "Available stock must be 0 or more"),
  rented_count: z.coerce.number().min(0, "Rented count must be 0 or more"),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

const InventoryManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any>(null);
  const queryClient = useQueryClient();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      product_id: "",
      total_stock: 0,
      available_stock: 0,
      rented_count: 0,
    },
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          products (
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

  const { data: products } = useQuery({
    queryKey: ["admin-products-for-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Get products that don't have inventory yet
  const availableProducts = products?.filter(
    (p) => !inventory?.some((i) => i.product_id === p.id) || editingInventory?.product_id === p.id
  );

  const createMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const { error } = await supabase.from("inventory").insert({
        product_id: data.product_id,
        total_stock: data.total_stock,
        available_stock: data.available_stock,
        rented_count: data.rented_count,
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
          rented_count: data.rented_count,
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
      product_id: item.product_id,
      total_stock: item.total_stock,
      available_stock: item.available_stock,
      rented_count: item.rented_count,
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
          disabled={!availableProducts?.length && !editingInventory}
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
              No inventory records. Add stock for your products!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Rented</TableHead>
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
                        {item.products?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{item.products?.theme}</TableCell>
                      <TableCell className="text-center">
                        {item.total_stock}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.available_stock}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.rented_count}
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
          <DialogContent>
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
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!editingInventory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(editingInventory ? products : availableProducts)?.map(
                            (product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
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
                        <FormLabel>Available</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rented_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rented</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2 justify-end">
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
