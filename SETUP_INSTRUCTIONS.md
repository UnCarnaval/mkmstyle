# Instrucciones de Configuración - Plataforma de Sorteos

## 1. Usuarios de Prueba

### Crear Usuarios Manualmente

Ve a tu aplicación y regístrate con estos usuarios:

**Usuario Admin:**
- Email: `admin@sorteos.com`
- Password: `Admin2024!Secure`

**Usuario Normal:**
- Email: `user@sorteos.com`
- Password: `User2024!Secure`

### Asignar Rol de Admin

Después de crear el usuario admin, ejecuta este comando en el SQL Editor de Supabase:

\`\`\`sql
SELECT public.make_user_admin('admin@sorteos.com');
\`\`\`

O directamente con el ID del usuario:

\`\`\`sql
UPDATE public.profiles SET role = 'admin' WHERE id = 'ID-DEL-USUARIO-ADMIN';
\`\`\`

---

## 2. Configuración de Métodos de Pago

### ✅ Stripe (YA CONFIGURADO)
- `STRIPE_SECRET_KEY` - ✓ Configurada
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - ✓ Configurada

### ⚠️ PayPal (PENDIENTE)

1. Ve a https://developer.paypal.com
2. Crea una aplicación
3. Obtén las credenciales:
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
4. Agrégalas en Vercel → Settings → Environment Variables

### ⚠️ NowPayments Crypto (PENDIENTE)

1. Ve a https://nowpayments.io
2. Regístrate y obtén tu API Key
3. Configura:
   - `NOWPAYMENTS_API_KEY`
   - `NOWPAYMENTS_IPN_SECRET` (para webhooks)
4. Agrégalas en Vercel → Settings → Environment Variables

---

## 3. Lo que FALTA para estar 100% Operativo

### 🔴 CRÍTICO (Requerido para producción)

1. **Webhooks de Pago**
   - Stripe webhook para confirmar pagos exitosos
   - PayPal webhook para verificar transacciones
   - NowPayments IPN para pagos crypto
   - Actualmente los pagos se registran pero no hay verificación del servidor

2. **Sistema de Sorteo**
   - Función automática para seleccionar ganador aleatorio cuando se vendan todos los boletos
   - Notificación por email al ganador
   - Cambiar status del sorteo a 'completed'

3. **Emails Transaccionales**
   - Confirmación de compra de boleto
   - Recordatorio cuando falten pocos boletos
   - Notificación de ganador
   - Sugerencia: Usar Resend, SendGrid o similar

4. **Seguridad en Pagos**
   - Validar pagos en el servidor antes de crear boletos
   - Evitar duplicación de números de boleto (actualmente es aleatorio)
   - Sistema de reembolso si el sorteo se cancela

### 🟡 IMPORTANTE (Mejorar experiencia)

5. **Dashboard de Usuario Mejorado**
   - Historial de sorteos ganados
   - Filtros por estado (activo, completado, ganado)
   - Notificaciones en la app

6. **Admin Panel Completo**
   - Seleccionar ganador manualmente
   - Ver lista de participantes por sorteo
   - Exportar datos de ventas
   - Configurar webhooks desde la UI

7. **Imágenes de Productos**
   - Subir imágenes propias (actualmente usa URLs de Unsplash)
   - Múltiples imágenes por sorteo
   - Integración con Vercel Blob Storage

### 🟢 OPCIONAL (Nice to have)

8. **Funcionalidades Extra**
   - Sistema de referidos (gana boletos gratis)
   - Descuentos por volumen (compra 5 boletos, lleva 6)
   - Sorteos privados con código de acceso
   - Compartir en redes sociales
   - Chat de soporte

9. **Analytics**
   - Google Analytics o Mixpanel
   - Conversión de visitantes a compradores
   - Sorteos más populares

10. **Mobile App**
    - PWA para instalar en móvil
    - Notificaciones push

---

## 4. Checklist de Lanzamiento

- [x] Base de datos con RLS
- [x] Autenticación de usuarios
- [x] Compra como invitado
- [x] Panel de administración
- [x] Gestión de sorteos
- [x] Integración Stripe
- [ ] Integración PayPal
- [ ] Integración NowPayments
- [ ] Webhooks de pago
- [ ] Sistema de sorteo automático
- [ ] Emails transaccionales
- [ ] Testing completo
- [ ] Políticas de privacidad y términos
- [ ] SSL y dominio personalizado

---

## 5. Próximos Pasos Inmediatos

1. Ejecutar el script SQL para crear usuarios de prueba
2. Asignar rol admin al usuario admin@sorteos.com
3. Probar flujo completo de compra con Stripe
4. Configurar PayPal y NowPayments
5. Implementar webhooks para confirmar pagos
6. Desarrollar sistema de selección de ganador
