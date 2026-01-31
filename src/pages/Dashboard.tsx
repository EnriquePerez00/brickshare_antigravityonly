import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Heart, Award, Loader2, Trash2, Shield, AlertTriangle, MapPin, Phone, Mail, Pencil, Package, ArrowLeftRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useSets } from "@/hooks/useProducts";
import { useOrders, useReturnSet } from "@/hooks/useOrders";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";

const Dashboard = () => {
  const { user, profile, isLoading: authLoading, deleteUserAccount } = useAuth();
  const { wishlistIds, toggleWishlist, isLoading: wishlistLoading } = useWishlist();
  const { data: sets = [], isLoading: setsLoading } = useSets(100);
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const returnMutation = useReturnSet();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedEnvioId, setSelectedEnvioId] = useState<string | null>(null);

  const handleReturnClick = (envioId: string) => {
    setSelectedEnvioId(envioId);
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = () => {
    if (selectedEnvioId) {
      returnMutation.mutate(selectedEnvioId);
      setReturnDialogOpen(false);
      setSelectedEnvioId(null);
    }
  };

  useEffect(() => {
    // Profile completion check removed as field doesn't exist in new schema
  }, [profile, authLoading]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wishlistSets = sets.filter((s) => wishlistIds.includes(s.id));
  const impactPoints = profile?.impact_points || 0;
  const impactHours = Math.floor(impactPoints / 10); // 10 points = 1 hour

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
              Mi Panel
            </h1>
            <p className="text-muted-foreground">
              Bienvenido, {profile?.full_name || user.email}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            {/* Profile Card */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center">
                  <User className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suscripción</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {(!profile?.subscription_type || profile.subscription_type === 'none')
                      ? "Sin Suscripción Activa"
                      : profile.subscription_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Wishlist Count */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En tu Wishlist</p>
                  <p className="text-lg font-semibold text-foreground">
                    {wishlistIds.length} sets
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Points */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <Award className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impacto Social</p>
                  <p className="text-lg font-semibold text-foreground">
                    {impactHours} horas
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Impact Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 mb-10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center shrink-0">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Tu impacto este mes
                </h3>
                <p className="text-muted-foreground">
                  Con tu suscripción has apoyado <span className="font-semibold text-primary">{impactHours} horas</span> de trabajo inclusivo.
                  Gracias a ti, personas con discapacidad tienen una ocupación digna preparando tus sets de LEGO.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Wishlist Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Mi Wishlist
            </h2>

            {wishlistLoading || setsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : wishlistSets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistSets.map((set) => (
                  <ProductCard
                    key={set.id}
                    id={set.id}
                    name={set.set_name}
                    imageUrl={set.set_image_url || "/placeholder.svg"}
                    theme={set.set_theme}
                    ageRange={set.set_age_range}
                    pieceCount={set.set_piece_count}
                    skillBoost={Array.isArray(set.skill_boost) ? (set.skill_boost as string[]).join(", ") : ""}
                    legoRef={set.set_ref || undefined}
                    description={set.set_description}
                    isWishlisted={true}
                    onWishlistToggle={toggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Tu wishlist está vacía
                </p>
                <Button asChild>
                  <a href="/catalogo">Explorar catálogo</a>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Order History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Mi Histórico
            </h2>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-hidden bg-card rounded-2xl shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="p-4 font-medium text-muted-foreground">Ref</th>
                        <th className="p-4 font-medium text-muted-foreground">Set</th>
                        <th className="p-4 font-medium text-muted-foreground">Estado</th>
                        <th className="p-4 font-medium text-muted-foreground">Fecha Actualización</th>
                        <th className="p-4 font-medium text-muted-foreground text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((order) => {
                        const getStatusBadge = (status: string) => {
                          const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
                            preparacion: { label: "En Preparación", variant: "outline" },
                            ruta_envio: { label: "En Ruta (Envío)", variant: "default" },
                            entregado: { label: "Entregado", variant: "default" },
                            devuelto: { label: "Devuelto", variant: "secondary" },
                            ruta_devolucion: { label: "En Ruta (Devolución)", variant: "secondary" },
                          };
                          const config = statusConfig[status] || { label: status, variant: "outline" };
                          return <Badge variant={config.variant}>{config.label}</Badge>;
                        };

                        const formatDate = (dateString: string) => {
                          return new Date(dateString).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                        };

                        const canReturn = order.estado_envio === 'entregado' || order.estado_envio === 'active';

                        return (
                          <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4 font-mono text-xs">{order.set_ref || "-"}</td>
                            <td className="p-4 font-medium">
                              <div className="flex items-center gap-3">
                                {order.sets?.set_image_url && (
                                  <img
                                    src={order.sets.set_image_url}
                                    alt={order.sets.set_name}
                                    className="w-10 h-10 rounded object-cover bg-secondary"
                                  />
                                )}
                                <span>{order.sets?.set_name || "Set Desconocido"}</span>
                              </div>
                            </td>
                            <td className="p-4">{getStatusBadge(order.estado_envio)}</td>
                            <td className="p-4 text-muted-foreground">{formatDate(order.updated_at)}</td>
                            <td className="p-4 text-right">
                              {canReturn && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                                  onClick={() => handleReturnClick(order.id)}
                                  disabled={returnMutation.isPending}
                                >
                                  <ArrowLeftRight className="h-3.5 w-3.5" />
                                  Devolver
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  No tienes envíos registrados
                </p>
                <p className="text-sm text-muted-foreground">
                  Tus asignaciones de sets aparecerán aquí
                </p>
              </div>
            )}
          </motion.div>

          {/* Security & Data Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-display font-bold text-foreground">
                  Seguridad y Datos
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar datos
              </Button>
            </div>

            {/* Contact Data Card */}
            <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
              <h3 className="font-semibold text-foreground mb-4">Datos de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="text-foreground">{profile?.full_name || "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{user?.email || "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="text-foreground">
                      {profile?.address ? (
                        <>
                          {profile.address}
                          {profile.zip_code && `, ${profile.zip_code}`}
                          {profile.city && ` ${profile.city}`}
                        </>
                      ) : (
                        "No especificada"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="text-foreground">{profile?.phone || "No especificado"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive h-fit">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Zona de Peligro</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Al eliminar tu cuenta, todos tus datos personales, wishlist e historial de suscripción se borrarán de forma permanente. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) {
                    const { error } = await deleteUserAccount();
                    if (error) {
                      alert("Error al eliminar la cuenta: " + error.message);
                    }
                  }
                }}
                className="shrink-0"
              >
                Eliminar Cuenta Permanente
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <ProfileCompletionModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <AlertDialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar devolución?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cambiará el estado del envío a "En Ruta (Devolución)". Asegúrate de preparar el paquete para su recogida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReturn} className="bg-orange-600 hover:bg-orange-700">
              Confirmar Devolución
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
