import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Download, Truck, Heart, Gift, Leaf, Users, Upload, MapPin, QrCode, Loader2, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDonation } from "@/hooks/useDonation";

const Donaciones = () => {
  const [kilos, setKilos] = useState([5]);
  const [selectedReward, setSelectedReward] = useState<"economica" | "social" | "">("");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    pesoEstimado: "",
    metodoEntrega: "punto-recogida" as "punto-recogida" | "recogida-domicilio",
  });
  const { submitDonation, isLoading, result } = useDonation();

  const ninosBeneficiados = kilos[0] * 2;
  const co2Evitado = (kilos[0] * 2.5).toFixed(1);

  const steps = [
    {
      icon: Package,
      title: "Mételos en una caja",
      description: "Te enviaremos una caja. No importa si están sucios o mezclados.",
    },
    {
      icon: Download,
      title: "Descarga tu etiqueta",
      description: "Etiqueta de envío gratuita lista para imprimir.",
    },
    {
      icon: Truck,
      title: "Envíalo sin coste",
      description: "Déjalo en un punto de recogida o pide recogida a domicilio.",
    },
  ];

  const faqs = [
    {
      question: "¿Tengo que lavarlos?",
      answer: "No, nosotros aplicamos un proceso de desinfección profesional. Recibimos las piezas tal cual están y nos encargamos de dejarlas como nuevas.",
    },
    {
      question: "¿Y si hay piezas que no son LEGO?",
      answer: "No te preocupes, las reciclaremos responsablemente por ti. Separamos los materiales y nos aseguramos de darles el mejor destino posible.",
    },
    {
      question: "¿Cuánto tiempo tarda el proceso?",
      answer: "Una vez recibamos tu donación, en 3-5 días hábiles procesamos las piezas y te enviamos la confirmación junto con tu recompensa elegida.",
    },
    {
      question: "¿Hay un mínimo de peso para donar?",
      answer: "Aceptamos donaciones desde 1kg. Cada pieza cuenta y puede hacer feliz a un niño.",
    },
  ];

  const handleSubmitDonation = async () => {
    if (!selectedReward) {
      return;
    }
    
    const peso = parseFloat(formData.pesoEstimado) || kilos[0];
    
    const donationResult = await submitDonation({
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono || undefined,
      direccion: formData.direccion || undefined,
      peso_estimado: peso,
      metodo_entrega: formData.metodoEntrega,
      recompensa: selectedReward,
    });

    if (donationResult.success) {
      setCurrentStep(4);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 3) {
      handleSubmitDonation();
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 gradient-hero opacity-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">Dona y transforma vidas</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
                No dejes que sus sueños{" "}
                <span className="text-gradient">acumulen polvo</span>
                <br />
                Reactiva tu LEGO
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Convierte tus piezas olvidadas en nuevas oportunidades para otros niños. 
                Sin limpiar, sin ordenar. Nosotros nos encargamos del resto.
              </p>
              
              <Button size="lg" className="gradient-hero text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Heart className="mr-2 h-5 w-5" />
                Empezar mi Donación
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Zero Effort Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Cero esfuerzo, máximo impacto
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Donar nunca fue tan fácil. Solo tres pasos y listo.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all duration-300 bg-card">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-hero flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Calculator */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Calcula tu impacto
                </h2>
                <p className="text-muted-foreground text-lg">
                  Descubre cuántos niños pueden beneficiarse de tu donación
                </p>
              </div>

              <Card className="border-0 shadow-card bg-card">
                <CardContent className="p-8 md:p-12">
                  <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-lg font-medium">Kilos aproximados</Label>
                      <span className="text-3xl font-display font-bold text-primary">{kilos[0]} kg</span>
                    </div>
                    <Slider
                      value={kilos}
                      onValueChange={setKilos}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>1 kg</span>
                      <span>50 kg</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      key={`ninos-${kilos[0]}`}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 rounded-2xl bg-primary/5 border border-primary/10"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-muted-foreground font-medium">Niños beneficiados</span>
                      </div>
                      <p className="text-4xl font-display font-bold text-foreground">
                        {ninosBeneficiados}
                        <span className="text-lg font-normal text-muted-foreground ml-2">/ mes</span>
                      </p>
                    </motion.div>

                    <motion.div
                      key={`co2-${kilos[0]}`}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 rounded-2xl bg-accent/50 border border-accent"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-accent">
                          <Leaf className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <span className="text-muted-foreground font-medium">CO₂ evitado</span>
                      </div>
                      <p className="text-4xl font-display font-bold text-foreground">
                        {co2Evitado}
                        <span className="text-lg font-normal text-muted-foreground ml-2">kg</span>
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Rewards Selection */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Elige tu recompensa
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Agradecemos tu generosidad. Elige cómo quieres que te lo devolvamos.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <RadioGroup value={selectedReward} onValueChange={(value) => setSelectedReward(value as "economica" | "social")} className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Label htmlFor="economica" className="cursor-pointer">
                    <Card className={`h-full border-2 transition-all duration-300 ${selectedReward === "economica" ? "border-primary shadow-lg" : "border-transparent shadow-card hover:shadow-card-hover"}`}>
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value="economica" id="economica" className="mt-1" />
                          <div className="flex-1">
                            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4">
                              <Gift className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                              Opción Económica
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              Vale por un descuento de <span className="font-semibold text-primary">5€</span> en una suscripción Brick Master por cada kg donado.
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              <Gift className="h-3 w-3" />
                              Ahorra en tu próxima suscripción
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Label htmlFor="social" className="cursor-pointer">
                    <Card className={`h-full border-2 transition-all duration-300 ${selectedReward === "social" ? "border-primary shadow-lg" : "border-transparent shadow-card hover:shadow-card-hover"}`}>
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value="social" id="social" className="mt-1" />
                          <div className="flex-1">
                            <div className="w-12 h-12 rounded-xl gradient-impact flex items-center justify-center mb-4">
                              <Heart className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                              Opción Social
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              Dona <span className="font-semibold text-primary">3€</span> por kg en concepto de suscripción a centros colaboradores de BrickShare.
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                              <Heart className="h-3 w-3" />
                              Multiplica tu impacto social
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </motion.div>
              </RadioGroup>
            </div>
          </div>
        </section>

        {/* Donation Form */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Completa tu donación
              </h2>
              <p className="text-muted-foreground text-lg">
                Solo unos datos más y estarás listo para enviar
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              {/* Progress Steps */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep >= step
                          ? "gradient-hero text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-full h-1 mx-2 rounded ${
                          currentStep > step ? "bg-primary" : "bg-muted"
                        }`}
                        style={{ width: "60px" }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <Card className="border-0 shadow-card">
                <CardContent className="p-8">
                  {/* Step 1: Contact Data */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-display font-semibold mb-6">Datos de contacto</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nombre">Nombre completo</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Tu nombre"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="tu@email.com"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            placeholder="+34 600 000 000"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Weight and Photos */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-display font-semibold mb-6">Peso estimado y fotos</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="peso">Peso estimado (kg)</Label>
                          <Input
                            id="peso"
                            type="number"
                            value={formData.pesoEstimado}
                            onChange={(e) => setFormData({ ...formData, pesoEstimado: e.target.value })}
                            placeholder="Ej: 5"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Fotos (opcional)</Label>
                          <div className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                              Arrastra fotos aquí o haz clic para subir
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              Nos ayuda a preparar mejor el proceso
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Delivery Method */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-display font-semibold mb-6">Método de entrega</h3>
                      <RadioGroup
                        value={formData.metodoEntrega}
                        onValueChange={(value) => setFormData({ ...formData, metodoEntrega: value as "punto-recogida" | "recogida-domicilio" })}
                        className="space-y-4"
                      >
                        <Label htmlFor="punto-recogida" className="cursor-pointer">
                          <Card className={`border-2 transition-all ${formData.metodoEntrega === "punto-recogida" ? "border-primary" : "border-transparent"}`}>
                            <CardContent className="p-4 flex items-center gap-4">
                              <RadioGroupItem value="punto-recogida" id="punto-recogida" />
                              <MapPin className="h-6 w-6 text-primary" />
                              <div>
                                <p className="font-medium">Punto de recogida</p>
                                <p className="text-sm text-muted-foreground">Déjalo en un punto cercano</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                        <Label htmlFor="recogida-domicilio" className="cursor-pointer">
                          <Card className={`border-2 transition-all ${formData.metodoEntrega === "recogida-domicilio" ? "border-primary" : "border-transparent"}`}>
                            <CardContent className="p-4 flex items-center gap-4">
                              <RadioGroupItem value="recogida-domicilio" id="recogida-domicilio" />
                              <Truck className="h-6 w-6 text-primary" />
                              <div>
                                <p className="font-medium">Recogida a domicilio</p>
                                <p className="text-sm text-muted-foreground">Pasamos a buscarlo</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </RadioGroup>

                      {formData.metodoEntrega === "recogida-domicilio" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-4"
                        >
                          <Label htmlFor="direccion">Dirección de recogida</Label>
                          <Input
                            id="direccion"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            placeholder="Tu dirección completa"
                            className="mt-2"
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Confirmation */}
                  {currentStep === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-center space-y-6"
                    >
                      <div className="w-20 h-20 mx-auto rounded-full gradient-hero flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-display font-semibold">¡Todo listo!</h3>
                      <p className="text-muted-foreground">
                        Tu donación ha sido registrada. Te hemos enviado un email con los detalles.
                      </p>
                      
                      {result?.donation && (
                        <div className="bg-muted/50 rounded-xl p-6 text-left space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Código de seguimiento:</span>
                            <span className="font-semibold text-primary">{result.donation.tracking_code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Niños beneficiados:</span>
                            <span className="font-medium">{result.donation.ninos_beneficiados} / mes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CO₂ evitado:</span>
                            <span className="font-medium">{result.donation.co2_evitado} kg</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="gradient-hero text-primary-foreground">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar etiqueta PDF
                        </Button>
                        <Button variant="outline">
                          <QrCode className="mr-2 h-4 w-4" />
                          Ver código QR
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  {currentStep < 4 && (
                    <div className="flex justify-between mt-8 pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        disabled={currentStep === 1 || isLoading}
                      >
                        Anterior
                      </Button>
                      <Button 
                        onClick={handleNextStep} 
                        className="gradient-hero text-primary-foreground"
                        disabled={isLoading || (currentStep === 3 && !selectedReward)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : currentStep === 3 ? (
                          "Confirmar donación"
                        ) : (
                          "Siguiente"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-muted-foreground text-lg">
                Resolvemos tus dudas sobre el proceso de donación
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AccordionItem value={`item-${index}`} className="border rounded-xl px-6 bg-card shadow-sm">
                      <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Donaciones;
