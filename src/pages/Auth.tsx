import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Blocks, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Email no válido");
const passwordSchema = z.string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[0-9]/, "Debe contener al menos un número");

const Auth = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const [mode, setMode] = useState<"login" | "signup" | "forgot-password" | "update-password">(
    type === "recovery" ? "update-password" : "login"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; policy?: string }>({});

  const { signIn, signUp, signInWithGoogle, resetPassword, updateUserPassword, user, isAdmin, isOperador, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const redirectBasedOnRole = () => {
    if (isAdmin) {
      navigate("/admin");
    } else if (isOperador) {
      navigate("/operaciones");
    } else {
      navigate("/");
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      redirectBasedOnRole();
    }
  }, [user, isAdmin, isOperador, authLoading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; policy?: string } = {};

    if (mode !== "update-password") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }

    if (mode !== "forgot-password") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === "signup" && !policyAccepted) {
      newErrors.policy = "Debes aceptar la política de privacidad";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Error al iniciar sesión",
          description: error.message === "Invalid login credentials"
            ? "Credenciales incorrectas"
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
        // Note: redirection will be handled by the useEffect once roles are loaded
      }
    } else if (mode === "signup") {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes("already registered")) {
          errorMessage = "Este email ya está registrado";
        }
        toast({
          title: "Error al registrarse",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para confirmar la cuenta",
        });
        setMode("login");
      }
    } else if (mode === "forgot-password") {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado",
          description: "Revisa tu bandeja de entrada para recuperar tu contraseña",
        });
        setMode("login");
      }
    } else if (mode === "update-password") {
      const { error } = await updateUserPassword(password);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada correctamente",
        });
        redirectBasedOnRole();
      }
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Error con Google",
        description: error.message,
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
    // No need to setIsGoogleLoading(false) on success - page will redirect
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group">
            <div className="p-2 rounded-xl gradient-hero group-hover:scale-105 transition-transform">
              <Blocks className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">
              Brickshare
            </span>
          </a>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-card p-8">
          <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
            {mode === "login" && "Iniciar sesión"}
            {mode === "signup" && "Crear cuenta"}
            {mode === "forgot-password" && "Recuperar contraseña"}
            {mode === "update-password" && "Nueva contraseña"}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {mode === "login" && "Accede a tu cuenta para gestionar tu wishlist"}
            {mode === "signup" && "Únete a Brickshare y comienza a jugar"}
            {mode === "forgot-password" && "Te enviaremos un email para restablecer tu acceso"}
            {mode === "update-password" && "Introduce tu nueva contraseña segura"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Tu nombre"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {mode !== "update-password" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            )}

            {mode !== "forgot-password" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">
                    {mode === "update-password" ? "Nueva contraseña" : "Contraseña"}
                  </Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot-password")}
                      className="text-xs text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="policy"
                    checked={policyAccepted}
                    onCheckedChange={(checked) => {
                      setPolicyAccepted(checked === true);
                      setErrors(prev => ({ ...prev, policy: undefined }));
                    }}
                  />
                  <label
                    htmlFor="policy"
                    className="text-xs leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    He leído y acepto la{" "}
                    <Link to="/privacidad" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                    .
                  </label>
                </div>
                {errors.policy && (
                  <p className="text-xs text-destructive">{errors.policy}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-hero"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" && "Iniciar sesión"}
              {mode === "signup" && "Crear cuenta"}
              {mode === "forgot-password" && "Enviar instrucciones"}
              {mode === "update-password" && "Actualizar contraseña"}
            </Button>
          </form>

          {(mode === "login" || mode === "signup") && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full"
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continuar con Google
              </Button>
            </>
          )}

          <div className="mt-6 text-center">
            {mode === "forgot-password" ? (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </button>
            ) : mode === "update-password" ? (
              null
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === "login"
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
