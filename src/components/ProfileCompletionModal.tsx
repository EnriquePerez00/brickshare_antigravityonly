import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Phone, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileCompletionModal = ({ open, onClose }: ProfileCompletionModalProps) => {
  const { profile, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    direccion: "",
    codigo_postal: "",
    ciudad: "",
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await updateProfile({
      ...formData,
      profile_completed: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Perfil completado!",
        description: "Tus datos de contacto se han guardado correctamente",
      });
      await refreshProfile();
      onClose();
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Completa tu perfil</DialogTitle>
          <DialogDescription>
            Añade tus datos de contacto para mejorar tu experiencia con Brickshare
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="full_name"
                placeholder="Tu nombre y apellidos"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="direccion"
                placeholder="Calle, número, piso..."
                value={formData.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo_postal">Código postal</Label>
              <Input
                id="codigo_postal"
                placeholder="28001"
                value={formData.codigo_postal}
                onChange={(e) => handleChange("codigo_postal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                placeholder="Madrid"
                value={formData.ciudad}
                onChange={(e) => handleChange("ciudad", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono de contacto</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefono"
                type="tel"
                placeholder="+34 600 000 000"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Más tarde
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gradient-hero"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionModal;
