# Cambios UI/UX en MakingMoney Sorteos — Abril 2026

## Contexto

Seis cambios solicitados por el dueño del producto sobre la plataforma MakingMoney Style:

1. Eliminar el campo de descripción al crear sorteos.
2. Reemplazar el carrusel del hero por una imagen estática configurable desde admin ("Cambiar portada").
3. Actualizar el número de WhatsApp del bubble flotante.
4. El form de confirmación de compra por transferencia bancaria, al enviar, debe limpiar los campos pero NO cerrar el modal ni redirigir.
5. Rediseñar la UX de selección de bancos dentro del modal de transferencia: fila de logos seleccionables + panel de detalle único.
6. Manager unificado en admin para "métodos de pago manuales": el admin agrega bancos (con cédula opcional y moneda) o métodos tipo link (PayPal, Stripe Link, etc. con usuario + link de pago), y el modal de transferencia los renderiza dinámicamente según su tipo.

## Requisitos

### 1. Eliminar descripción del formulario de sorteos

- El form `components/raffle-form.tsx` no debe tener campo de descripción.
- La columna `description` (NOT NULL en BD) se preserva sin migración.
- Sorteos nuevos guardan `description = ""`.
- Sorteos viejos conservan su descripción original; donde se mostraba (`/admin/raffles` y Stripe Checkout), si está vacío se usa el `title` como fallback.

### 2. Hero estático configurable

- La portada del home (`/`) deja de rotar imágenes de sorteos.
- Hay una imagen única configurable globalmente, almacenada en `site_settings.hero_image_url` (nueva columna nullable).
- El admin sube/cambia esa imagen desde `/admin/settings`, en una sección nueva debajo del logo, con un botón **"Cambiar portada"** que sigue el mismo patrón que el upload del logo (Vercel Blob vía `/api/upload`).
- Si no hay portada subida, el hero se renderiza en fondo negro plano con solo el texto "Participa / Gana / Representa" y los CTAs.

### 3. WhatsApp

- El número del bubble flotante (`components/whatsapp-bubble.tsx`) cambia de `18498829551` a `18495799551`.

### 4. Form de transferencia bancaria sin cierre automático

- Al enviar exitosamente el form de `BankTransferCheckout`, los inputs (nombre, email, teléfono, referencia, screenshot) se limpian y aparece el toast de éxito.
- El modal **NO se cierra automáticamente**. El usuario decide cuándo cerrarlo con la X.

### 5. UX de selección de bancos

- En `BankTransferCheckout`, en lugar de listar todas las cuentas como tarjetas apiladas:
  - Una fila horizontal con los logos de cada banco activo (cuadrado de 64px en mobile, 80px en sm+, scrollable horizontalmente si no caben).
  - Al cargar el modal, se autoselecciona el primer banco activo.
  - El banco seleccionado se distingue con borde `cyan-400` (color de acento del modal) y un check `CheckCircle2` pequeño en esquina superior derecha; los demás se atenúan a `opacity-40` pero siguen siendo clickeables para cambiar.
  - Debajo de la fila aparece el panel con la información detallada del banco seleccionado: nombre, titular, número de cuenta, tipo. Cada campo conserva su botón individual de copiar.
  - Si un banco no tiene `bank_logo`, se muestra ícono `Building2` + nombre debajo (consistente con fallbacks existentes).

### 6. Manager unificado de métodos de pago manuales

- La tabla `bank_accounts` se extiende para soportar dos tipos de entrada (`entry_type`):
  - `bank` (default): cuenta bancaria tradicional con titular, número de cuenta, tipo y **cédula opcional**.
  - `payment_link`: método de pago externo (ej. PayPal, Stripe Link) con **usuario** + **link de pago**.
- Ambos tipos comparten: `bank_name` (nombre visible), `bank_logo`, `is_active`, `currency` opcional (`DOP`/`USD`/`EUR`/null).
- En `/admin/settings`, el manager `BankAccountsManager` permite elegir el tipo al agregar/editar y muestra solo los campos relevantes a ese tipo.
- El logo deja de ser solo URL: se agrega botón **"Subir logo"** que sube el archivo a Vercel Blob (reusa `/api/upload-raffle-image`, ≤5 MB, image/* only).
- En el modal `BankTransferCheckout`, la fila de logos incluye TODOS los items activos sin distinguir tipo. El panel de detalle se renderiza distinto según `entry_type`:
  - `bank`: campos titular, número de cuenta, tipo, cédula (si existe) — cada uno con copy button.
  - `payment_link`: "Usuario: {username}" con copy + botón cyan **"Pagar en {bank_name}"** que abre `payment_link` en nueva pestaña. El form de referencia + screenshot debajo sigue igual (el cliente paga en el link y vuelve a subir el comprobante).
- Si `currency` está definida, se muestra como badge (`USD`, `DOP`, etc.) en la esquina superior derecha del card de detalle.

## Diseño de implementación

### Cambios en BD

Nueva migración `scripts/031_add_hero_image.sql`:

```sql
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
```

Sin RLS extra: `site_settings` ya tiene políticas de SELECT público y UPDATE solo admin (migración 015).

Nueva migración `scripts/032_payment_methods.sql`:

```sql
ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'bank'
    CHECK (entry_type IN ('bank','payment_link')),
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS cedula TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS payment_link TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

ALTER TABLE bank_accounts
  ALTER COLUMN account_number DROP NOT NULL,
  ALTER COLUMN account_holder DROP NOT NULL,
  ALTER COLUMN account_type DROP NOT NULL;
```

Las columnas existentes pasan a NULLable porque solo aplican a `entry_type='bank'`. Las filas previas conservan sus datos y `entry_type='bank'` por default. Sin cambios de RLS — las políticas existentes siguen vigentes.

### Cambios en código

#### `components/raffle-form.tsx`
Eliminar el bloque del label "Descripción" + textarea (líneas 121-131 del archivo actual). El resto del form queda intacto.

#### `app/actions/admin.ts`
En `createRaffle` y `updateRaffle`: reemplazar `const description = formData.get("description") as string` por `const description = ""`. Mantener el campo `description` en el INSERT/UPDATE para satisfacer el NOT NULL.

#### `app/admin/raffles/page.tsx`
Línea 170: `{raffle.description}` → `{raffle.description || raffle.title}`.

#### `app/actions/stripe.ts`
Línea 50: `description: raffle.description` → `description: raffle.description || raffle.title`.

#### `app/actions/site-settings.ts`
- `updateSiteSettings`: aceptar `heroImageUrl: string | null` en el payload, persistir en el `update` junto con `site_name` y `logo_url`.
- `getSiteSettings`: ya devuelve `*`, sin cambios.

#### `components/site-settings-manager.tsx`
- Prop `initialSettings` extendida con `hero_image_url: string | null`.
- Nuevos estados: `heroImageUrl`, `uploadingHero`.
- Nueva sección "Portada del sitio" debajo del logo:
  - Input de URL editable.
  - Botón "Cambiar portada" que dispara file picker (`<input type="file" accept="image/*">`).
  - Reusa el mismo handler que el logo (`/api/upload`), con loading state separado.
  - Vista previa de la imagen actual (mismo patrón que el logo).
- `handleSave` envía `heroImageUrl: heroImageUrl || null`.

#### `app/admin/settings/page.tsx`
Pasar `hero_image_url` como prop a `<SiteSettingsManager initialSettings={...} />`.

#### `components/hero.tsx` (nuevo, server component)
- Recibe prop `heroImageUrl: string | null`.
- Renderiza el mismo layout que el `HeroRotator` actual (texto, gradient, botón "Descubrir" + botón secundario) pero sin el estado de rotación ni los dot indicators.
- Si `heroImageUrl` está presente: pinta el `<img>` de fondo con el filtro `brightness(0.62) saturate(0.75)`.
- Si no: omite el `<img>` (queda solo el fondo `#080808` heredado del layout).
- Botón "Descubrir" sigue apuntando a `#sorteos` (anchor a la sección debajo).
- El segundo botón cambia: el actual "Ver sorteo →" enlaza a un raffle individual (`/raffle/${current.id}`); el nuevo se llama **"Ver sorteos"** y enlaza a `/sorteos`. Sin contexto de raffle individual aquí, esa es la salida natural.

#### `app/page.tsx`
- Quitar import y uso de `HeroRotator`.
- Importar y usar `Hero` y `getSiteSettings`.
- Cargar `const settings = await getSiteSettings()` junto con el query de raffles.
- Renderizar `<Hero heroImageUrl={settings.hero_image_url} />`.

#### `components/hero-rotator.tsx`
Borrar el archivo.

#### `components/whatsapp-bubble.tsx`
Línea 4: `const phone = "18498829551"` → `const phone = "18495799551"`.

#### `components/bank-transfer-checkout.tsx`
Dos cambios independientes:

**a) Quitar cierre automático tras éxito:**
En `handleSubmit`, dentro del bloque `if (result.success && result.tickets.length > 0)` (líneas 129-150 del archivo actual), eliminar la línea `onClose()` (línea 149). Mantener todo lo demás (limpieza de estado y `swal.success`).

**b) Nueva UX de selección de bancos:**

Estado nuevo:
```tsx
const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
```

En el `useEffect` que carga cuentas, después del `setBankAccounts`, si hay cuentas: `setSelectedBankId(accounts[0].id)`.

Reemplazar el render de `bankAccounts.map()` (líneas 215-276 actuales) por dos bloques:

**Bloque A — fila de logos:** (requiere import de `cn` desde `@/lib/utils`, ya disponible)
```tsx
<div className="flex gap-3 overflow-x-auto py-2">
  {bankAccounts.map((account) => {
    const isSelected = selectedBankId === account.id
    return (
      <button
        key={account.id}
        type="button"
        onClick={() => setSelectedBankId(account.id)}
        className={cn(
          "relative flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 transition-all flex-shrink-0",
          isSelected
            ? "border-cyan-400 opacity-100"
            : "border-slate-700 opacity-40 hover:opacity-70"
        )}
      >
        {account.bank_logo ? (
          <div className="w-full h-full bg-white p-1 rounded-md flex items-center justify-center">
            <img src={account.bank_logo} alt={account.bank_name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <>
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span className="text-[10px] text-slate-300 mt-1 truncate max-w-full px-1">{account.bank_name}</span>
          </>
        )}
        {isSelected && (
          <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-cyan-400 bg-slate-900 rounded-full" />
        )}
      </button>
    )
  })}
</div>
```

**Bloque B — panel del banco seleccionado:**
Una sola `<Card>` con la misma estructura que tienen hoy las tarjetas individuales (líneas 216-275 actuales) pero rendereada solo para `bankAccounts.find(a => a.id === selectedBankId)`. Mantiene los tres campos (Titular, Número de cuenta, Tipo) con sus copy buttons existentes.

Si `selectedBankId === null` (caso defensivo, no debería ocurrir tras autoselección), mostrar un placeholder textual "Selecciona un banco para ver la información".

Los estados de loading (skeleton), error (banner rojo) y vacío (banner amber) se mantienen sin cambios — solo se reemplaza el render cuando `bankAccounts.length > 0`.

#### `app/actions/payments.ts`

Extender `createBankAccount` y `updateBankAccount` para aceptar el payload nuevo:

```ts
type EntryType = "bank" | "payment_link"

interface PaymentMethodInput {
  entryType: EntryType
  bankName: string          // nombre visible (siempre requerido)
  bankLogo?: string
  currency?: string | null  // 'DOP' | 'USD' | 'EUR' | null
  // entry_type='bank'
  accountHolder?: string
  accountNumber?: string
  accountType?: string
  cedula?: string | null
  // entry_type='payment_link'
  username?: string
  paymentLink?: string
  // solo update
  isActive?: boolean
}
```

Validación server-side antes del insert/update:
- `bankName` requerido siempre.
- Si `entryType==='bank'`: `accountHolder` y `accountNumber` requeridos. Persiste `account_holder`, `account_number`, `account_type`, `cedula`. Limpia `username` y `payment_link` (NULL).
- Si `entryType==='payment_link'`: `username` y `paymentLink` requeridos; `paymentLink` debe parsear como URL válida (`new URL(paymentLink)` en try/catch). Persiste `username` y `payment_link`. Limpia `account_holder`, `account_number`, `account_type`, `cedula` (NULL).
- En ambos casos persiste `entry_type`, `bank_name`, `bank_logo`, `currency`, `is_active`.

`getBankAccounts` y `getAllBankAccounts` ya devuelven `*`, así que automáticamente exponen los nuevos campos sin cambios.

#### `components/bank-accounts-manager.tsx`

- `BankAccount` interface extendida con `entry_type`, `currency`, `cedula`, `username`, `payment_link`.
- `formData` extendido con los mismos campos + `entryType` (default `"bank"`).
- Selector de tipo arriba del form (radio o tabs): **`Banco`** | **`Método de pago (link)`**. Cambiar el tipo limpia los campos del otro tipo.
- Render condicional en el form:
  - `entryType==='bank'`: nombre del banco, titular, número de cuenta, tipo de cuenta, **cédula (opcional)**.
  - `entryType==='payment_link'`: nombre del método (ej. "PayPal"), **usuario** (requerido), **link de pago** (requerido, type=url).
  - Comunes a ambos: select de moneda (`DOP` / `USD` / `EUR` / `Sin moneda`), input de logo (URL) + botón "Subir logo".
- Botón "Subir logo": dispara `<input type="file" accept="image/*">`, sube vía `fetch('/api/upload-raffle-image', { method: 'POST', body: FormData })` (mismo endpoint que el upload de imagen de raffle, devuelve `{ url }`). Estado `uploadingLogo` separado del submit.
- Listado: cada card muestra los campos relevantes a su `entry_type` (oculta los campos de banco si es `payment_link` y viceversa). El badge de moneda se renderiza junto al nombre si está presente.

#### `components/bank-transfer-checkout.tsx` (cambios adicionales sobre el bloque B)

El bloque B (panel del banco seleccionado) se vuelve condicional según `selectedBank.entry_type`:

**Cabecera común** (logo + nombre + badge de moneda):
```tsx
<div className="flex items-center gap-2 sm:gap-3 mb-3">
  {/* logo igual que antes */}
  <h3 className="font-semibold text-white text-sm sm:text-base flex-1">{selectedBank.bank_name}</h3>
  {selectedBank.currency && (
    <span className="text-[10px] font-bold tracking-wider text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
      {selectedBank.currency}
    </span>
  )}
</div>
```

**Si `entry_type === 'bank'`:** render actual (titular, número de cuenta, tipo) + nuevo bloque opcional para `cedula` con copy button (mismo patrón que los demás campos), solo si `selectedBank.cedula` está definido.

**Si `entry_type === 'payment_link'`:**
```tsx
<div className="space-y-3">
  <div className="flex flex-col gap-1">
    <span className="text-xs text-slate-400">Usuario:</span>
    <div className="flex items-center gap-2">
      <span className="text-white text-sm flex-1 break-words">{selectedBank.username}</span>
      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedBank.username, `user-${selectedBank.id}`)} className="flex-shrink-0 h-8 w-8 p-0">
        {copiedField === `user-${selectedBank.id}` ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  </div>
  <a
    href={selectedBank.payment_link}
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md text-sm"
  >
    Pagar en {selectedBank.bank_name}
  </a>
</div>
```

El form de comprobante (referencia + screenshot) NO cambia: aplica para ambos tipos, ya que el cliente paga en el link externo y vuelve a subir comprobante para que admin verifique. No se introduce un flujo separado.

## Convenciones del proyecto a respetar

- Todos los textos visibles al usuario en español.
- Los logs server-side llevan prefijo `[v0]`.
- Server actions admin re-verifican `profiles.role === 'admin'` (ya cumplido en `updateSiteSettings` existente).
- Migraciones append-only: `031_add_hero_image.sql` y `032_payment_methods.sql` son los siguientes números (la última actual es `030`).
- SweetAlert2 vía `lib/swal.ts` para notificaciones (ya en uso).

## Verificación manual

Después de aplicar la migración y los cambios de código:

1. `npm run dev`.
2. **Settings:** ir a `/admin/settings`, subir imagen, guardar. Confirmar que aparece la vista previa.
3. **Hero con imagen:** ir a `/`, confirmar que se ve la imagen de fondo (no carrusel, sin dots indicadores).
4. **Hero sin imagen:** vaciar `hero_image_url` y guardar. Volver a `/` y confirmar fondo negro + texto + CTAs.
5. **Crear sorteo:** ir a `/admin/raffles/new`, confirmar que NO existe el campo descripción. Crear un sorteo. Confirmar que aparece en `/admin/raffles` (mostrando el título donde antes iba la descripción).
6. **WhatsApp:** click en burbuja → confirmar que abre `wa.me/18495799551`.
7. **Transferencia bancaria:** abrir el modal desde un sorteo. Confirmar fila de logos arriba con primer banco seleccionado. Click en otro logo cambia la selección y la info debajo. Click en cada copy button copia el dato. Llenar el form, enviar. Confirmar toast de éxito + form limpio + modal sigue abierto. Cerrar manualmente con X.
8. **Manager unificado de pagos (banco):** en `/admin/settings`, agregar una entrada tipo **Banco** con cédula y moneda `USD`. Confirmar que en el modal de transferencia aparece como un logo más en la fila, con badge `USD` en el card de detalle y la cédula con copy button.
9. **Manager unificado de pagos (link):** en `/admin/settings`, agregar una entrada tipo **Método de pago** (ej. nombre "PayPal", usuario `makingmoney`, link `https://paypal.me/makingmoney`). Confirmar que en el modal aparece en la fila, al seleccionarlo se ve "Usuario:" + botón **"Pagar en PayPal"** que abre el link en nueva pestaña. El form de comprobante sigue funcionando para registrar el ticket pendiente.
10. **Subir logo:** en el manager admin, click en "Subir logo" → seleccionar archivo PNG. Confirmar que la URL del logo se popula automáticamente y la vista previa se ve. Guardar y verificar que el logo aparece en la fila del modal de transferencia.
11. **Validación servidor:** intentar guardar un método de pago sin usuario o sin link → confirmar mensaje de error en español. Intentar guardar un banco sin titular o sin número de cuenta → confirmar mensaje de error.

## Fuera de alcance

- Sin cambios de schema en `raffles.description` (queda NOT NULL, simplemente se guarda string vacío).
- Sin tests automatizados (el proyecto no tiene suite).
- Sin cambios a los flujos integrados de Stripe/PayPal/crypto (sus checkouts, webhooks y server actions quedan iguales). Las entradas `payment_link` del nuevo manager son links manuales (paypal.me, Stripe Payment Link, etc.) que NO usan el SDK ni los webhooks — el cliente paga afuera y vuelve a subir comprobante igual que con un banco.
- Sin migración de datos existentes (sorteos viejos preservan su descripción).
- Sin internacionalización del bubble de WhatsApp (sigue en español).
