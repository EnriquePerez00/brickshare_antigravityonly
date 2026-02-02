import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    PaymentElement,
    useStripe,
    useElements,
    Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface CheckoutFormProps {
    onSuccess: () => void;
    onError: (message: string) => void;
    onCancel: () => void;
    planName: string;
}

const CheckoutForm = ({ onSuccess, onError, onCancel, planName }: CheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { updateProfile } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard`,
            },
            redirect: "if_required",
        });

        if (error) {
            onError(error.message ?? "Ocurrió un error inesperado.");
            toast({
                title: "Error en el pago",
                description: error.message,
                variant: "destructive",
            });
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Update user subscription status immediately on success
            await updateProfile({
                subscription_status: 'active',
                subscription_type: planName
            });
            onSuccess();
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <div className="flex gap-3 justify-end">
                <Button variant="outline" type="button" onClick={onCancel} disabled={isProcessing}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={!stripe || isProcessing} className="bg-primary">
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        "Pasarela Pago"
                    )}
                </Button>
            </div>
        </form>
    );
};

interface StripePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientSecret: string | null;
    planName: string;
}

const StripePaymentModal = ({
    isOpen,
    onClose,
    clientSecret,
    planName,
}: StripePaymentModalProps) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) {
            setIsSuccess(false);
            setErrorMsg(null);
        }
    }, [isOpen]);

    if (isSuccess) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">¡Enhorabuena!</DialogTitle>
                        <DialogDescription className="text-lg mt-2">
                            Suscripción activada para el plan <strong>{planName}</strong>.
                            <br />
                            Selecciona tus primeros sets del catálogo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6">
                        <Button onClick={() => {
                            onClose();
                            navigate("/catalogo");
                        }} className="w-full">
                            Ir al Catálogo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (errorMsg) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Error en el pago</DialogTitle>
                        <DialogDescription className="text-lg mt-2">
                            {errorMsg}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6">
                        <Button onClick={onClose} variant="destructive" className="w-full">
                            Volver a elegir plan
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Finalizar Suscripción</DialogTitle>
                    <DialogDescription>
                        Estás contratando el plan <strong>{planName}</strong>. Introduce tus datos de pago de forma segura.
                    </DialogDescription>
                </DialogHeader>
                {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm
                            onSuccess={() => setIsSuccess(true)}
                            onError={(msg) => setErrorMsg(msg)}
                            onCancel={onClose}
                            planName={planName}
                        />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StripePaymentModal;
