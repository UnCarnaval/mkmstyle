# Configuración de Variables de Entorno en Vercel

## Cómo Agregar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable con su valor
4. Selecciona los ambientes: Production, Preview, Development

---

## Variables de Entorno Requeridas

### 🔵 Supabase (YA CONFIGURADAS)
Estas ya están en tu proyecto de Vercel:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### 🟢 Stripe (YA CONFIGURADAS)
Estas ya están en tu proyecto de Vercel:

\`\`\`
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (PENDIENTE - Ver sección de webhooks)
\`\`\`

### 🟡 PayPal (DEBES AGREGAR)

**Pasos para obtener credenciales:**
1. Ve a https://developer.paypal.com/dashboard/
2. Crea una aplicación (My Apps & Credentials → Create App)
3. Copia las credenciales

**Variables a agregar en Vercel:**
\`\`\`
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=ELxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_WEBHOOK_ID=8JR95xxxxxxxxxx (Para webhooks)
\`\`\`

**Ambiente de Testing:**
- Para desarrollo usa las credenciales de "Sandbox"
- Para producción usa las credenciales de "Live"

### 🟠 NowPayments Crypto (DEBES AGREGAR)

**Pasos para obtener API Key:**
1. Ve a https://nowpayments.io
2. Regístrate y verifica tu cuenta
3. Settings → API Keys → Generate API Key
4. Configura IPN para webhooks

**Variables a agregar en Vercel:**
\`\`\`
NOWPAYMENTS_API_KEY=xxxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOWPAYMENTS_IPN_SECRET=tu_secret_para_ipn (Opcional pero recomendado)
\`\`\`

### 🔴 Resend para Emails (DEBES AGREGAR)

**Pasos para obtener API Key:**
1. Ve a https://resend.com
2. Regístrate (gratis hasta 3,000 emails/mes)
3. API Keys → Create API Key
4. Verifica tu dominio para enviar desde tu email

**Variables a agregar en Vercel:**
\`\`\`
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@tusorteos.com (Usa tu dominio verificado)
\`\`\`

---

## Configuración de Webhooks

### Stripe Webhook

1. **Crear webhook en Stripe:**
   - Ve a https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://tu-dominio.vercel.app/api/webhooks/stripe`
   - Eventos a escuchar:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

2. **Agregar variable en Vercel:**
   \`\`\`
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   \`\`\`

### PayPal Webhook

1. **Crear webhook en PayPal:**
   - Ve a https://developer.paypal.com/dashboard/
   - Tu App → Webhooks → Add Webhook
   - URL: `https://tu-dominio.vercel.app/api/webhooks/paypal`
   - Eventos: 
     - `PAYMENT.CAPTURE.COMPLETED`
     - `PAYMENT.CAPTURE.DENIED`

2. **Agregar variable en Vercel:**
   \`\`\`
   PAYPAL_WEBHOOK_ID=8JR95xxxxxxxxxxxxxxxxxx
   \`\`\`

### NowPayments IPN (Crypto)

1. **Configurar IPN en NowPayments:**
   - Settings → IPN Settings
   - URL: `https://tu-dominio.vercel.app/api/webhooks/nowpayments`
   - Activa IPN callbacks

2. **Agregar variable en Vercel:**
   \`\`\`
   NOWPAYMENTS_IPN_SECRET=tu_secret_personalizado
   \`\`\`

---

## Verificación de Variables

Después de agregar todas las variables, verifica en tu panel admin:

1. Ve a `/admin/settings`
2. Revisa que todas las integraciones muestren "Configurada" ✓
3. Si alguna muestra "No configurada", agrega la variable faltante

---

## Ambientes en Vercel

Configura cada variable para los ambientes correctos:

- **Production:** Para tu sitio en vivo (usa credenciales reales)
- **Preview:** Para ramas de Git (puede usar credenciales de prueba)
- **Development:** Para localhost (usa credenciales de prueba)

### Recomendación:

Para **TODAS** las variables, marca los 3 ambientes (Production, Preview, Development) para evitar errores.

---

## Lista de Verificación

Marca cuando hayas agregado cada variable:

- [x] NEXT_PUBLIC_SUPABASE_URL
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
- [x] STRIPE_SECRET_KEY
- [x] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] NEXT_PUBLIC_PAYPAL_CLIENT_ID
- [ ] PAYPAL_CLIENT_SECRET
- [ ] PAYPAL_WEBHOOK_ID
- [ ] NOWPAYMENTS_API_KEY
- [ ] NOWPAYMENTS_IPN_SECRET
- [ ] RESEND_API_KEY
- [ ] RESEND_FROM_EMAIL

---

## Troubleshooting

### Error: "Missing environment variable"

**Solución:** La variable no está configurada en Vercel
1. Ve a Settings → Environment Variables
2. Agrega la variable faltante
3. Redeploy el proyecto

### Los webhooks no funcionan

**Solución:** 
1. Verifica que la URL del webhook esté correcta
2. Revisa los logs en Vercel (Deployments → Functions)
3. Prueba el webhook con las herramientas de testing:
   - Stripe: CLI para testing local
   - PayPal: Sandbox simulator
   - NowPayments: Test mode

### Los emails no se envían

**Solución:**
1. Verifica que RESEND_API_KEY esté correcta
2. Confirma que el dominio está verificado en Resend
3. Revisa los logs de Resend dashboard

---

## Contacto

Si tienes problemas configurando las variables, contacta al equipo de desarrollo.
