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
import { Pencil, Trash2, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLegoEnrichment } from "@/hooks/useLegoEnrichment";


const setSchema = z.object({
  set_name: z.string().min(1, "Name is required"),
  set_ref: z.string().optional(),
  set_description: z.string().optional(),
  set_theme: z.string().min(1, "Theme is required"),
  set_age_range: z.string().min(1, "Age range is required"),
  set_piece_count: z.coerce.number().min(1, "Piece count must be at least 1"),
  set_image_url: z.string().url().optional().or(z.literal("")),
  skill_boost: z.string().optional(),
  year_released: z.coerce.number().min(1900, "Valid year required").optional(),
  set_weight: z.coerce.number().optional().or(z.literal(0)),
  set_minifigs: z.coerce.number().optional().or(z.literal(0)),
  set_dim: z.string().optional(),
  catalogue_visibility: z.string().default("yes"),
});

type SetFormData = z.infer<typeof setSchema>;

const ProductsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'set' | 'pieces'>('set');
  const [editingSet, setEditingSet] = useState<any>(null);
  const queryClient = useQueryClient();
  const { fetchLegoData, isLoading: isEnriching } = useLegoEnrichment();

  const form = useForm<SetFormData>({
    resolver: zodResolver(setSchema),
    defaultValues: {
      set_name: "",
      set_ref: "",
      set_description: "",
      set_theme: "",
      set_age_range: "",
      set_piece_count: 0,
      set_image_url: "",
      skill_boost: "",
      year_released: new Date().getFullYear(),
      set_weight: 0,
      set_minifigs: 0,
      set_dim: "",
      catalogue_visibility: "yes",
    },
  });

  const { data: sets, isLoading } = useQuery({
    queryKey: ["admin-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sets")
        .select(`
          *,
          inventory_sets (
            inventory_set_total_qty
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any;
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
          set_name: data.set_name,
          set_ref: data.set_ref || null,
          set_description: data.set_description || null,
          set_theme: data.set_theme,
          set_age_range: data.set_age_range,
          set_piece_count: data.set_piece_count,
          set_image_url: data.set_image_url || null,
          skill_boost: skillBoostArray,
          year_released: data.year_released,
          set_weight: data.set_weight || null,
          set_minifigs: data.set_minifigs || null,
          set_dim: data.set_dim || null,
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
      set_name: set.set_name,
      set_ref: set.set_ref || "",
      set_description: set.set_description || "",
      set_theme: set.set_theme,
      set_age_range: set.set_age_range,
      set_piece_count: set.set_piece_count,
      set_image_url: set.set_image_url || "",
      skill_boost: set.skill_boost?.join(", ") || "",
      year_released: set.year_released,
      set_weight: set.set_weight || 0,
      set_minifigs: set.set_minifigs || 0,
      set_dim: set.set_dim || "",
      catalogue_visibility: set.catalogue_visibility ? "yes" : "no",
    });
    setIsDialogOpen(true);
  };

  const handleEnrich = async () => {
    const legoRef = form.getValues("set_ref");
    if (!legoRef) {
      toast.error("Por favor, introduce una referencia de LEGO");
      return;
    }

    const data = await fetchLegoData(legoRef);
    if (data) {
      form.setValue("set_name", data.name || form.getValues("set_name"));
      form.setValue("set_piece_count", data.piece_count || form.getValues("set_piece_count"));
      form.setValue("year_released", data.year_released || form.getValues("year_released"));
      form.setValue("set_image_url", data.image_url || form.getValues("set_image_url"));
      toast.success("Datos autocompletados desde Rebrickable");
    }
  };



  const handleSubmit = (data: SetFormData) => {
    if (editingSet) {
      updateMutation.mutate({ id: editingSet.id, data });
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
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">


            <Button
              size="sm"
              variant="outline"
              className="mr-2"
              onClick={() => {
                setImportMode('set');
                setIsImportDialogOpen(true);
              }}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Import Set (Ref)
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="mr-2"
              onClick={() => {
                setImportMode('pieces');
                setIsImportDialogOpen(true);
              }}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Import Pieces (x Set)
            </Button>



            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Edit Set
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="set_name"
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
                      name="set_ref"
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
                      name="set_description"
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
                        name="set_theme"
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
                        name="set_age_range"
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
                        name="set_piece_count"
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
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="set_weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (g)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="set_minifigs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minifigs</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="set_dim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dimensions</FormLabel>
                            <FormControl>
                              <Input placeholder="20x10x5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                      name="set_image_url"
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
                        disabled={updateMutation.isPending}
                      >
                        Update
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader >
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
          <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Stock Total</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sets?.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell className="font-medium">{set.set_ref || "-"}</TableCell>
                    <TableCell>{set.set_name}</TableCell>
                    <TableCell>{set.set_theme}</TableCell>
                    <TableCell>{set.inventory_sets?.inventory_set_total_qty || 0}</TableCell>
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
      <ImportSetDialog
        isOpen={isImportDialogOpen}
        mode={importMode}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-sets"] });
          setIsImportDialogOpen(false);
        }}
      />
    </Card >
  );
};

const ImportSetDialog = ({ isOpen, mode, onClose, onSuccess }: { isOpen: boolean; mode: 'set' | 'pieces'; onClose: () => void; onSuccess: () => void }) => {
  const [ref, setRef] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  const handleReset = () => {
    setRef("");
    setPreviewData(null);
    setStep('input');
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePreview = async () => {
    if (!ref) {
      toast.error("Please enter a reference");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-lego-set', {
        body: { set_ref: ref, action: 'preview' }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setPreviewData(data.data);
      setStep('preview');
    } catch (err: any) {
      console.error("Preview error:", err);
      toast.error("Failed to fetch preview: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const action = mode === 'pieces' ? 'import_pieces' : 'import';
      const { data, error } = await supabase.functions.invoke('add-lego-set', {
        body: { set_ref: ref, action }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success(data.message || "Operation successful");
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error("Failed to import: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'pieces' ? 'Import Pieces Only' : 'Import Set from Rebrickable'}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {step === 'input'
              ? "Enter the LEGO set reference to preview details."
              : "Review the set details below before importing."}
          </div>
        </DialogHeader>

        <div className="py-4">
          {step === 'input' ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="ref" className="text-right text-sm font-medium">
                LEGO Ref
              </label>
              <Input
                id="ref"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. 75078-1"
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePreview();
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {previewData && (
                <div className="flex gap-4">
                  {previewData.set_image_url && (
                    <img
                      src={previewData.set_image_url}
                      alt={previewData.set_name}
                      className="w-24 h-24 object-contain rounded border"
                    />
                  )}
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Ref:</span> {previewData.set_ref}</p>
                    <p><span className="font-semibold">Name:</span> {previewData.set_name}</p>
                    <p><span className="font-semibold">Theme:</span> {previewData.set_theme}</p>
                    <p><span className="font-semibold">Year:</span> {previewData.year_released}</p>
                    <p><span className="font-semibold">Parts:</span> {previewData.set_piece_count}</p>
                  </div>
                </div>
              )}
              <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                <p className="font-semibold mb-1">Warning:</p>
                {mode === 'pieces' ? (
                  <p>This will <strong>replace all existing pieces</strong> for this set in the database. The set must already exist.</p>
                ) : (
                  <p>Importing will create the set as <strong>Active</strong> and overwrite any existing inventory for this reference.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {step === 'input' ? (
            <Button onClick={handlePreview} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Preview
            </Button>
          ) : (
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'pieces' ? 'Confirm Import Pieces' : 'Confirm Import Set'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsManager;

