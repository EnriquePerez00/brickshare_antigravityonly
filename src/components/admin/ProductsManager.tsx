import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Wand2, Loader2, FileText, Boxes } from "lucide-react";
import { toast } from "sonner";
import { useLegoEnrichment } from "@/hooks/useLegoEnrichment";
import Papa from "papaparse";
import { useRef } from "react";


const setSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lego_ref: z.string().optional(),
  description: z.string().optional(),
  theme: z.string().min(1, "Theme is required"),
  age_range: z.string().min(1, "Age range is required"),
  piece_count: z.coerce.number().min(1, "Piece count must be at least 1"),
  image_url: z.string().url().optional().or(z.literal("")),
  skill_boost: z.string().optional(),
  year_released: z.coerce.number().min(1900, "Valid year required").optional(),
  weight_set: z.coerce.number().optional().or(z.literal(0)),
  catalogue_visibility: z.string().default("yes"),
});

type SetFormData = z.infer<typeof setSchema>;

const ProductsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<any>(null);
  const queryClient = useQueryClient();
  const { fetchLegoData, isLoading: isEnriching } = useLegoEnrichment();

  const form = useForm<SetFormData>({
    resolver: zodResolver(setSchema),
    defaultValues: {
      name: "",
      lego_ref: "",
      description: "",
      theme: "",
      age_range: "",
      piece_count: 0,
      image_url: "",
      skill_boost: "",
      year_released: new Date().getFullYear(),
      weight_set: 0,
      catalogue_visibility: "yes",
    },
  });

  const { data: sets, isLoading } = useQuery({
    queryKey: ["admin-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SetFormData) => {
      const skillBoostArray = data.skill_boost
        ? data.skill_boost.split(",").map((s) => s.trim())
        : null;

      const { error } = await supabase.from("sets").insert({
        name: data.name,
        lego_ref: data.lego_ref || null,
        description: data.description || null,
        theme: data.theme,
        age_range: data.age_range,
        piece_count: data.piece_count,
        image_url: data.image_url || null,
        skill_boost: skillBoostArray,
        year_released: data.year_released,
        weight_set: data.weight_set || null,
        catalogue_visibility: data.catalogue_visibility === "yes",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sets"] });
      toast.success("Set created successfully");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create set: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SetFormData }) => {
      const skillBoostArray = data.skill_boost
        ? data.skill_boost.split(",").map((s) => s.trim())
        : null;

      const { error } = await supabase
        .from("sets")
        .update({
          name: data.name,
          lego_ref: data.lego_ref || null,
          description: data.description || null,
          theme: data.theme,
          age_range: data.age_range,
          piece_count: data.piece_count,
          image_url: data.image_url || null,
          skill_boost: skillBoostArray,
          year_released: data.year_released,
          weight_set: data.weight_set || null,
          catalogue_visibility: data.catalogue_visibility === "yes",
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sets"] });
      toast.success("Set updated successfully");
      setIsDialogOpen(false);
      setEditingSet(null);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to update set: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sets"] });
      toast.success("Set deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete set: " + error.message);
    },
  });

  const handleEdit = (set: any) => {
    setEditingSet(set);
    form.reset({
      name: set.name,
      lego_ref: set.lego_ref || "",
      description: set.description || "",
      theme: set.theme,
      age_range: set.age_range,
      piece_count: set.piece_count,
      image_url: set.image_url || "",
      skill_boost: set.skill_boost?.join(", ") || "",
      year_released: set.year_released,
      weight_set: set.weight_set || 0,
      catalogue_visibility: set.catalogue_visibility ? "yes" : "no",
    });
    setIsDialogOpen(true);
  };

  const handleEnrich = async () => {
    const legoRef = form.getValues("lego_ref");
    if (!legoRef) {
      toast.error("Por favor, introduce una referencia de LEGO");
      return;
    }

    const data = await fetchLegoData(legoRef);
    if (data) {
      form.setValue("name", data.name || form.getValues("name"));
      form.setValue("piece_count", data.piece_count || form.getValues("piece_count"));
      form.setValue("year_released", data.year_released || form.getValues("year_released"));
      form.setValue("image_url", data.image_url || form.getValues("image_url"));
      toast.success("Datos autocompletados desde Rebrickable");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        if (data.length === 0) {
          toast.error("El archivo CSV está vacío");
          return;
        }

        const setsToInsert = data.map((row) => ({
          name: row.name,
          lego_ref: row.lego_ref || null,
          description: row.description || null,
          theme: row.theme,
          age_range: row.age_range,
          piece_count: parseInt(row.piece_count) || 0,
          image_url: row.image_url || null,
          weight_set: parseFloat(row.weight_set) || 0,
          year_released: parseInt(row.year_released) || null,
          skill_boost: row.skill_boost ? row.skill_boost.split(",").map((s: string) => s.trim()) : null,
          catalogue_visibility: row.catalogue_visibility === "no" ? false : true,
        }));

        try {
          const { error } = await supabase.from("sets").insert(setsToInsert);
          if (error) throw error;
          toast.success(`${setsToInsert.length} sets importados correctamente`);
          queryClient.invalidateQueries({ queryKey: ["admin-sets"] });
        } catch (error: any) {
          toast.error("Error al importar sets: " + error.message);
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

  const handleSubmit = (data: SetFormData) => {
    if (editingSet) {
      updateMutation.mutate({ id: editingSet.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSet(null);
    form.reset();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <CardTitle>Gestión de Sets LEGO</CardTitle>
        <div className="flex gap-4 items-center"> {/* Simplified layout */}
          {/* Grupo Ficha Producto */}
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleCSVUpload}
            />
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Subir CSV
              </Button>
              <span className="text-[10px] text-muted-foreground">sube template ficha producto</span>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingSet(null);
                    form.reset();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Set
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSet ? "Edit Set" : "Add New Set"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="LEGO City Police" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lego_ref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referencia LEGO</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="75192" {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              onClick={handleEnrich}
                              disabled={isEnriching}
                              title="Autocompletar con Rebrickable"
                            >
                              {isEnriching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                < Wand2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A fun police station set..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age_range"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age Range</FormLabel>
                            <FormControl>
                              <Input placeholder="6-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="piece_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Piece Count</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="500" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="year_released"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Released</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2023" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="weight_set"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (grams)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="catalogue_visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catalogue Visibility</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Show in catalogue?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="skill_boost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (comma separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Creativity, Problem Solving"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                        {editingSet ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sets?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No sets yet. Add your first LEGO set!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Weight (g)</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sets?.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell className="font-medium">{set.lego_ref || "-"}</TableCell>
                    <TableCell>{set.name}</TableCell>
                    <TableCell>{set.theme}</TableCell>
                    <TableCell>{set.year_released || "-"}</TableCell>
                    <TableCell>{set.weight_set || "-"}</TableCell>
                    <TableCell>{set.catalogue_visibility ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(set)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(set.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card >
  );
};

export default ProductsManager;
