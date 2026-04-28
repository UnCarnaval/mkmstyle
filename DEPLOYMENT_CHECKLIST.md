# Lista de Verificación para Producción

## ✅ Completado

### Base de Datos
- [x] Esquema de base de datos con RLS
- [x] Tablas: profiles, raffles, tickets
- [x] Políticas de seguridad Row Level Security
- [x] Sistema de roles (admin/user)
- [x] Función para insertar boletos (protección contra overselling)
- [x] Soporte para compras de invitados

### Autenticación
- [x] Sistema completo de autenticación con Supabase
- [x] Páginas de login y registro
- [x] Middleware para protección de rutas
- [x] Cliente singleton para evitar múltiples instancias

### Frontend
- [x] Página principal con grid de sorteos
- [x] Diseño glassmorphism premium
- [x] Página de detalle de sorteo
- [x] Dashboard de usuario
- [x] Panel de administración completo
- [x] Responsive design
- [x] Animaciones suaves

### Pagos
- [x] Integración Stripe con checkout embebido
- [x] Integración PayPal
- [x] Integración NowPayments (crypto)
- [x] Webhooks configurados para los 3 métodos
- [x] Compras como invitado

### Sistema de Sorteos
- [x] Función para seleccionar ganador aleatorio
- [x] Botón en admin para realizar sorteo
- [x] Actualización de estado del sorteo
- [x] Detección automática de sorteos completos

### Emails
- [x] Sistema de emails transaccionales
- [x] Email de confirmación de compra
- [x] Email de notificación al ganador
- [x] Templates HTML profesionales

### Páginas Legales
- [x] Política de Privacidad
- [x] Términos y Condiciones
- [x] Footer con enlaces legales

## 🔧 Configuración Requerida en Producción

### 1. Webhooks de Stripe
\`\`\`bash
# Configurar webhook en Stripe Dashboard:
URL: https://tu-dominio.com/api/webhooks/stripe
Eventos: checkout.session.completed
\`\`\`
Agregar variable de entorno:
\`\`\`
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
\`\`\`

### 2. Webhooks de PayPal
\`\`\`bash
# Configurar webhook en PayPal Dashboard:
URL: https://tu-dominio.com/api/webhooks/paypal
Eventos: PAYMENT.CAPTURE.COMPLETED
\`\`\`

### 3. Webhooks de NowPayments
\`\`\`bash
# Configurar IPN en NowPayments Dashboard:
URL: https://tu-dominio.com/api/webhooks/nowpayments
\`\`\`

### 4. Servicio de Email
Integrar un servicio de email real (elegir uno):

**Opción A: Resend (recomendado)**
\`\`\`bash
npm install resend
\`\`\`
Agregar en `lib/emails.ts`:
\`\`\`typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
\`\`\`

**Opción B: SendGrid**
\`\`\`bash
npm install @sendgrid/mail
\`\`\`

**Opción C: AWS SES, Postmark, etc.**

### 5. Variables de Entorno en Producción
Verificar que todas estén configuradas en Vercel:
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (o el servicio de email elegido)
- Todas las existentes de Supabase, Stripe, etc.

### 6. Crear Usuario Admin
Ejecutar en Supabase SQL Editor:
\`\`\`sql
-- Actualizar el email con tu usuario admin real
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@tudominio.com';
\`\`\`

### 7. Configuración de Dominio
- Conectar dominio personalizado en Vercel
- Configurar SSL (automático con Vercel)
- Actualizar URLs de redirect en Supabase Auth

### 8. Imágenes de Productos
Reemplazar las URLs de Unsplash con imágenes propias:
- Subir a Vercel Blob o CDN
- Actualizar URLs en la base de datos

## 📊 Testing en Producción

### Checklist de Pruebas
- [ ] Registro de usuario nuevo
- [ ] Login de usuario existente
- [ ] Compra con tarjeta (Stripe)
- [ ] Compra con PayPal
- [ ] Compra como invitado
- [ ] Webhook recibe el pago correctamente
- [ ] Email de confirmación se envía
- [ ] Boleto aparece en dashboard
- [ ] Admin puede ver todos los boletos
- [ ] Admin puede realizar sorteo
- [ ] Email de ganador se envía
- [ ] Estado del sorteo se actualiza a completado

## 🚀 Optimizaciones Opcionales

### Rendimiento
- [ ] Configurar caché en Vercel Edge
- [ ] Optimizar imágenes con Next.js Image
- [ ] Implementar ISR para páginas de sorteos

### Seguridad
- [ ] Rate limiting en webhooks
- [ ] Validación adicional de pagos
- [ ] Logs de auditoría para acciones de admin

### Funcionalidad
- [ ] Sistema de cupones/descuentos
- [ ] Programa de referidos
- [ ] Historial de sorteos ganados
- [ ] Página de ganadores públicos
- [ ] Estadísticas públicas de sorteos

### Marketing
- [ ] Integración con Google Analytics
- [ ] Pixel de Facebook
- [ ] Meta tags para SEO
- [ ] Open Graph para redes sociales

## 📝 Notas

- Los webhooks DEBEN estar configurados para que los pagos se registren automáticamente
- Sin el servicio de email, los usuarios no recibirán confirmaciones (se mostrarán solo en logs)
- El sistema de sorteo automático está listo pero requiere un cron job o similar para verificar periódicamente

## ✅ Estado Actual

La plataforma está **95% completa**. Solo falta:
1. Configurar webhooks en producción
2. Configurar servicio de email real
3. Crear usuario admin inicial
4. Testing completo en producción
