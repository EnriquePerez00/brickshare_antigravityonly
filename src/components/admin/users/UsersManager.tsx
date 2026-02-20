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
import { Pencil, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

const userSchema = z.object({
    full_name: z.string().min(1, "El nombre es obligatorio"),
    user_status: z.string().min(1, "El estado es obligatorio"),
    subscription_status: z.string().optional(),
    subscription_type: z.string().optional(),
    impact_points: z.coerce.number().default(0),
});

type UserFormData = z.infer<typeof userSchema>;

const UsersManager = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const queryClient = useQueryClient();

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            full_name: "",
            user_status: "sin set",
            subscription_status: "inactive",
            subscription_type: "Brick Starter",
            impact_points: 0,
        },
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UserFormData }) => {
            const { error } = await supabase
                .from("users")
                .update({
                    full_name: data.full_name,
                    user_status: data.user_status,
                    subscription_status: data.subscription_status,
                    subscription_type: data.subscription_type,
                    impact_points: data.impact_points,
                })
                .eq("user_id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Usuario actualizado correctamente");
            setIsDialogOpen(false);
            setEditingUser(null);
            form.reset();
        },
        onError: (error: any) => {
            toast.error("Error al actualizar usuario: " + error.message);
        },
    });

    const handleEdit = (user: any) => {
        setEditingUser(user);
        form.reset({
            full_name: user.full_name || "",
            user_status: user.user_status || "sin set",
            subscription_status: user.subscription_status || "inactive",
            subscription_type: user.subscription_type || "Brick Starter",
            impact_points: user.impact_points || 0,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (data: UserFormData) => {
        if (editingUser) {
            updateMutation.mutate({ id: editingUser.user_id, data });
        }
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingUser(null);
        form.reset();
    };

    return (
        <Card>
            <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestión de Usuarios
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : users?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No se encontraron usuarios.
                    </p>
                ) : (
                    <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card z-10">
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Suscripción</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Puntos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((user) => (
                                    <TableRow key={user.user_id}>
                                        <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                                        <TableCell className="capitalize">{user.user_status}</TableCell>
                                        <TableCell className="capitalize">{user.subscription_status}</TableCell>
                                        <TableCell>{user.subscription_type || "-"}</TableCell>
                                        <TableCell>{user.impact_points}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Editar Usuario</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre Completo</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="user_status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar estado" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="sin set">Sin set</SelectItem>
                                                        <SelectItem value="con set">Con set</SelectItem>
                                                        <SelectItem value="en transito">En tránsito</SelectItem>
                                                        <SelectItem value="esperando recepcion">Esperando recepción</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="impact_points"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Puntos de Impacto</FormLabel>
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
                                        name="subscription_status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado Suscripción</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar estado" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Activa</SelectItem>
                                                        <SelectItem value="inactive">Inactiva</SelectItem>
                                                        <SelectItem value="trialing">Prueba</SelectItem>
                                                        <SelectItem value="past_due">Atrasada</SelectItem>
                                                        <SelectItem value="canceled">Cancelada</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="subscription_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo Suscripción</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Brick Starter">Brick Starter</SelectItem>
                                                        <SelectItem value="Pro">Pro</SelectItem>
                                                        <SelectItem value="Master">Master</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar Cambios
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

export default UsersManager;
