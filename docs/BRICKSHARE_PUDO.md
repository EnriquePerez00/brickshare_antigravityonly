# 📦 Brickshare PUDO QR System

> Sistema completo de códigos QR para gestión de entregas y devoluciones en puntos Brickshare

## 🎯 Características Principales

✅ **Flujo Dual de Envíos**
- Soporta puntos Correos (flujo existente con API de Correos)
- Soporta puntos Brickshare (nuevo flujo con QR codes)

✅ **QR Codes Seguros**
- Generación automática de códigos únicos
- Expiración configurable (30 días por defecto)
- Validación de un solo uso
- Códigos separados para entrega y devolución

✅ **API Móvil sin Datos Personales**
- Validación pública de QR codes
- No expone información personal del usuario
- Sistema de confirmación con auditoría completa

✅ **Notificaciones Automáticas**
- Emails con QR de entrega
- Emails con QR de devolución
- Plantillas HTML profesionales

✅ **Aplicación Móvil**
- Scanner de QR en tiempo real
- Interfaz intuitiva para puntos PUDO
- Validación instantánea

## 🚀 Quick Start

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Aplicar Migración de Base de Datos

```bash
supabase db push
```

### 3. Desplegar Edge Functions

```bash
# API de validación de QR
supabase functions deploy brickshare-qr-api

# Servicio de envío de emails
supabase functions deploy send-brickshare-qr-email
```

### 4. Configurar Variables de Entorno

En Supabase Dashboard > Project Settings > Edge Functions:
```
RESEND_API_KEY=tu_api_key
```

### 5. Añadir Puntos PUDO

```sql
INSERT INTO brickshare_pudo_locations (
  id, name, address, city, postal_code, province,
  latitude, longitude, contact_email, is_active
) VALUES (
  'BS-PUDO-001',
  'Brickshare Madrid Centro',
  'Calle Gran Vía 28',
  'Madrid', '28013', 'Madrid',
  40.4200, -3.7038,
  'madrid.centro@brickshare.com',
  true
);
```

## 📖 Uso Básico

### Frontend - Crear Envío Brickshare

```typescript
import { useBrickshareShipments } from '@/hooks/useBrickshareShipments';

const { updateToBricksharePudo, generateDeliveryQR } = useBrickshareShipments();

// Configurar punto Brickshare
await updateToBricksharePudo.mutateAsync({
  shipmentId: 'uuid',
  pudoId: 'BS-PUDO-001'
});

// Generar y enviar QR por email
await generateDeliveryQR.mutateAsync('uuid');
```

### App Móvil - Validar QR

```typescript
// Validar QR escaneado
const response = await fetch(
  `${API_URL}/validate/${qrCode}`
);
const { success, data } = await response.json();

if (success) {
  // Mostrar info y confirmar
  await fetch(`${API_URL}/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      qr_code: qrCode,
      validated_by: 'BS-PUDO-001'
    })
  });
}
```

## 📚 Documentación

- **[Guía Rápida](docs/BRICKSHARE_PUDO_QUICKSTART.md)** - Start here!
- **[API Reference](docs/BRICKSHARE_PUDO_QR_API.md)** - Documentación completa de API
- **[Implementation Summary](docs/BRICKSHARE_PUDO_IMPLEMENTATION_SUMMARY.md)** - Resumen de implementación
- **[Deployment Guide](docs/BRICKSHARE_PUDO_DEPLOYMENT.md)** - Checklist de despliegue

## 🔌 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/validate/{qr}` | GET | Validar código QR |
| `/confirm` | POST | Confirmar validación |
| `/pudo-locations` | GET | Listar puntos PUDO |
| `/shipment/{id}` | GET | Detalles del envío (auth) |

## 🗄️ Base de Datos

### Nuevas Tablas
- `brickshare_pudo_locations` - Puntos físicos Brickshare
- `qr_validation_logs` - Registro de validaciones

### Campos Añadidos a `shipments`
- `pickup_type` - 'correos' | 'brickshare'
- `brickshare_pudo_id` - ID del punto PUDO
- `delivery_qr_code` - Código QR de entrega
- `delivery_qr_expires_at` - Expiración
- `delivery_validated_at` - Fecha de validación
- `return_qr_code` - Código QR de devolución
- `return_qr_expires_at` - Expiración
- `return_validated_at` - Fecha de validación

## 🧪 Testing

```bash
# Ejecutar tests end-to-end
npm run test:brickshare-qr

# Test manual con cURL
curl https://PROJECT.supabase.co/functions/v1/brickshare-qr-api/validate/BS-TEST123
```

## 🔐 Seguridad

### ❌ NO se expone
- Datos personales del usuario
- Email, teléfono, dirección
- Información de pago

### ✅ SÍ se expone (API pública)
- Información del set LEGO
- Estado del envío
- Tipo de validación
- ID del punto PUDO

## 📊 Flujo Completo

```
1. Usuario selecciona punto Brickshare
   ↓
2. Se genera QR de entrega → Email enviado
   ↓
3. Usuario presenta QR en punto PUDO
   ↓
4. Punto PUDO escanea y valida → Estado: delivered
   ↓
5. Usuario solicita devolución
   ↓
6. Se genera QR de devolución → Email enviado
   ↓
7. Usuario entrega set en punto PUDO
   ↓
8. Punto PUDO escanea y valida → Estado: returned
```

## 📱 Aplicación Móvil

Ubicación: `apps/ios/screens/QRScannerScreen.tsx`

**Características**:
- Scanner de códigos QR en tiempo real
- Validación automática
- Confirmación con doble verificación
- Manejo de errores
- Interfaz moderna y responsive

## 🛠️ Mantenimiento

### Ver Logs de Validación
```sql
SELECT * FROM qr_validation_logs
ORDER BY validated_at DESC
LIMIT 50;
```

### Regenerar QR Expirado
```sql
-- Entrega
SELECT * FROM generate_delivery_qr('shipment-uuid');

-- Devolución
SELECT * FROM generate_return_qr('shipment-uuid');
```

### Desactivar Punto PUDO
```sql
UPDATE brickshare_pudo_locations
SET is_active = false
WHERE id = 'BS-PUDO-001';
```

## ⚠️ Problemas Comunes

| Error | Solución |
|-------|----------|
| QR not found | Verificar que se generó correctamente |
| Already used | Es de un solo uso, generar nuevo |
| Expired | Regenerar (30 días máx) |
| Cannot return | Primero validar entrega |

## 📞 Soporte

- **Documentación**: Ver carpeta `/docs`
- **Issues**: GitHub Issues
- **Email**: tech@brickshare.com

## 📄 Licencia

© 2026 Brickshare. Todos los derechos reservados.

---

**Versión**: 1.0.0  
**Última actualización**: 20 de Marzo de 2026  
**Estado**: ✅ Producción Ready