# Rediseño editorial de `/dashboard` y `/admin/*` (alineación con landing)

**Fecha:** 2026-04-25
**Alcance:** `/dashboard` (área de usuario) + `/admin/*` (todo el panel administrativo)
**Objetivo:** unificar el lenguaje visual de las áreas autenticadas con la línea editorial / brutal-minimal monocromática que ya gobierna la landing (`app/page.tsx`).

---

## 1. Diagnóstico de la divergencia actual

La landing usa un sistema visual coherente:

- Fondo plano `#080808` (no gradientes), superficie elevada `#0d0d0d`.
- Paleta monocromática: blanco como único acento sobre negro/neutral. Cero gradientes de color en títulos.
- Tipografía editorial: eyebrow `text-xs font-semibold tracking-[0.3em] uppercase` + headline `text-3xl sm:text-4xl font-black tracking-tight`.
- Bordes finos `rgba(255,255,255,0.07)` (≈ `border-white/[0.07]` o `white/5`).
- Esquinas rectas: ningún `rounded-2xl`, ningún `rounded-xl` decorativo.
- Cards/secciones se separan por **hairlines** (truco `grid gap-px bg-white/5`), no por espacios huecos.
- Animaciones: AOS `data-aos="fade-up"` (con `data-aos-delay` escalonado).

`/dashboard` y `/admin/*` rompen esta línea con:

- Títulos en gradiente cyan→blue (`bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent`) en todas las páginas.
- Layout admin con fondo gradiente `from-slate-950 via-blue-950 to-slate-950`.
- Cards `bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl` (glassmorphism + esquinas redondeadas).
- Botones primarios con gradientes coloridos (`from-cyan-500 to-blue-600`, `from-emerald-500 to-green-600`).
- Iconos en burbujas con gradientes decorativos (cyan/purple/pink/green/blue).
- Paleta `slate-*` (azulada) cuando la landing usa `neutral-*` (gris frío neutro).
- Badges de método de pago con cinco colores distintos (purple, blue, green, orange) — decorativo, no funcional.

## 2. Decisiones de diseño (acordadas)

1. **Alcance**: `/dashboard` + `/admin/*` (todas las rutas y componentes consumidos por ellas). Auth y otras áreas quedan fuera.
2. **Color**: monocromía + color funcional mínimo. Solo se conservan tres colores y exclusivamente para indicar **estado** (no decoración):
   - éxito / aprobado / completado / activo: `#22c55e`
   - pendiente / advertencia: `#f59e0b`
   - rechazado / fallido / destructivo: `#ef4444`
   Cualquier otro uso de cyan/purple/pink/blue/orange/green decorativo se elimina.
3. **Densidad**: editorial adaptada. Encabezados de página al estilo landing (eyebrow + `font-black`, `py-16 sm:py-20` o `py-12` cuando hay sidebar). Contenido operativo (tablas, listas, formularios) usa **densidad compacta** con el mismo vocabulario visual: bordes `white/[0.07]`, esquinas rectas, sin glass.
4. **Consistencia entre `/dashboard` y `/admin/*`**: un solo lenguaje visual; el admin no introduce un look paralelo, solo ajusta padding y agrega componentes operativos (tablas, search, paginación) usando el mismo vocabulario.

## 3. Sistema de diseño compartido

### 3.1 Tokens (en `app/globals.css`, dentro de `@theme inline`)

```css
--color-surface-0: #080808;   /* fondo página */
--color-surface-1: #0d0d0d;   /* superficie elevada (cards, filas hover-from) */
--color-surface-2: #121212;   /* superficie de inputs, hover de filas, modales */
--color-hairline: rgba(255, 255, 255, 0.07);

/* Estados funcionales — solo para badges/indicadores. NO se usan en gradientes. */
--color-state-success: #22c55e;
--color-state-warning: #f59e0b;
--color-state-danger:  #ef4444;
```

### 3.2 Utilidades (sustituyen a las clases `glass-*`)

```css
.editorial-eyebrow {
  @apply text-xs font-semibold tracking-[0.3em] uppercase text-white;
}

.editorial-heading {
  @apply text-3xl sm:text-4xl font-black text-white tracking-tight;
}

.editorial-card {
  /* superficie elevada con hairline; sin glass, sin rounded */
  background-color: var(--color-surface-1);
  border: 1px solid var(--color-hairline);
}

.editorial-input {
  @apply w-full px-4 py-3 bg-[#121212] border border-white/[0.07]
         text-white placeholder:text-neutral-500
         focus:border-white/40 focus:outline-none transition-colors;
}

.editorial-button-primary {
  /* botón primario monocromo: blanco sólido sobre negro, sin sombra de color */
  @apply inline-flex items-center justify-center gap-2
         bg-white text-black px-6 py-3
         text-sm font-semibold tracking-widest uppercase
         hover:bg-neutral-200 transition-colors disabled:opacity-50;
}

.editorial-button-secondary {
  /* outline blanco */
  @apply inline-flex items-center justify-center gap-2
         border border-white/20 hover:border-white text-white
         px-6 py-3 text-sm font-semibold tracking-widest uppercase
         hover:bg-white/[0.04] transition-colors disabled:opacity-50;
}

.editorial-button-danger {
  @apply inline-flex items-center justify-center gap-2
         border border-[color:var(--color-state-danger)]/40 text-[color:var(--color-state-danger)]
         hover:bg-[color:var(--color-state-danger)]/10
         px-6 py-3 text-sm font-semibold tracking-widest uppercase
         transition-colors disabled:opacity-50;
}

/* Badges de estado funcional */
.badge {
  @apply inline-flex items-center px-2.5 py-1
         text-[0.65rem] font-semibold tracking-[0.2em] uppercase;
}
.badge-success { @apply text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30; }
.badge-warning { @apply text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30; }
.badge-danger  { @apply text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30; }
.badge-neutral { @apply text-neutral-400 bg-white/[0.04] border border-white/10; }
```

### 3.3 Reglas globales legacy

Las clases `.glass-card`, `.glass-button`, `.glass-button-primary`, `.glass-button-secondary`, `.glass-input`, `.progress-glow`, `.animate-shimmer` **no se eliminan** en este alcance: son consumidas por rutas fuera de alcance (`/auth/*`, `/privacy`, `/terms`, `/not-found`) y por `components/crypto-checkout.tsx`. Se quedan en `globals.css` como código legacy. Cualquier consumo dentro del alcance (dashboard, admin) se reemplaza por las utilidades editoriales y al terminar el barrido se verifica con grep que esas rutas no las usen — pero las definiciones permanecen para no romper rutas externas.

### 3.4 Reglas globales de uso

- Ningún headline lleva gradiente de color. Headline = blanco sólido + eyebrow encima.
- Ningún botón lleva gradiente de color. Primario = blanco sobre negro. Acción destructiva = `editorial-button-danger`. Acción de estado positivo (aprobar) = blanco con icono verde si se quiere reforzar visualmente, pero el botón en sí no es verde.
- Ningún icono va dentro de una "burbuja con gradiente de color". Si se quiere realce, usar el patrón landing: icono blanco con halo `blur-xl` blanco al 10-20% detrás.
- Cards no usan `rounded-2xl`/`rounded-xl`. Esquinas rectas. La separación se logra con hairlines o con el truco `grid gap-px bg-white/5`.
- Inputs/textarea/select usan `editorial-input`. Foco con borde blanco al 40%, no anillo de color.

## 4. Sección — `/dashboard`

### 4.1 `app/dashboard/page.tsx`

Wrapper:

```tsx
<div className="min-h-screen bg-[#080808] py-16 sm:py-20 px-4 sm:px-6">
  <div className="container mx-auto max-w-7xl">
    <header className="mb-12" data-aos="fade-up">
      <p className="editorial-eyebrow mb-2">Tu cuenta</p>
      <h1 className="editorial-heading">
        Mi <span className="text-white">Dashboard</span>
      </h1>
      <p className="text-neutral-500 text-sm mt-3">
        Bienvenido, {profile?.full_name || user.email}
      </p>
    </header>

    <DashboardStats … />

    <section className="mt-16" data-aos="fade-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="editorial-eyebrow mb-2">Historial</p>
          <h2 className="editorial-heading">Mis <span className="text-white">Boletos</span></h2>
        </div>
        <Link href="/sorteos" className="text-neutral-400 hover:text-white text-sm font-semibold tracking-widest uppercase flex items-center gap-2 group">
          Ver sorteos <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
      <UserTickets … />
    </section>
  </div>
</div>
```

Cambios clave: fuera el gradiente cyan→blue del título, fuera `text-slate-*`, fuera el padding pequeño `py-12 px-4`. El padding lateral pasa a `px-4 sm:px-6` igual que las secciones de la landing.

### 4.2 `components/dashboard-stats.tsx`

Tres tarjetas en `grid gap-px bg-white/5` (mismo patrón que la sección "Por qué elegirnos" del landing):

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
  {stats.map(({ label, title, value, icon: Icon }, i) => (
    <div
      key={label}
      className="bg-[#080808] p-8 group hover:bg-[#0d0d0d] transition-colors"
      data-aos="fade-up"
      data-aos-delay={i * 100}
    >
      <div className="w-12 h-12 flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 blur-xl rounded-full opacity-60 bg-white/10 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-6 h-6 relative z-10 text-white" />
      </div>
      <p className="editorial-eyebrow mb-2">{label}</p>
      <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
      <p className="text-neutral-500 text-sm">{title}</p>
      <div className="mt-6 h-px bg-gradient-to-r from-white/40 to-transparent" />
    </div>
  ))}
</div>
```

Stats:

| label      | title             | value                          | icon (lucide) |
|------------|-------------------|--------------------------------|---------------|
| Boletos    | Total comprados   | `totalTickets`                 | `Ticket`      |
| Sorteos    | Activos           | `activeTickets`                | `Sparkles`    |
| Inversión  | Total acumulado   | `"$" + totalSpent.toFixed(2)`  | `Wallet`      |

Eliminado: SVGs inline, gradientes `from-cyan-500 to-blue-600` / `from-purple-500 to-pink-600` / `from-green-500 to-emerald-600`, gradiente verde sobre el monto, `glass-card`, `rounded-2xl`, paleta slate.

### 4.3 `components/user-tickets.tsx`

**Estado vacío:**

```tsx
<div className="editorial-card p-12 text-center">
  <p className="editorial-eyebrow mb-3">Sin actividad</p>
  <h3 className="text-2xl font-black text-white mb-3">No tienes boletos todavía</h3>
  <p className="text-neutral-500 mb-6 text-sm">
    Participa en un sorteo para ver tus boletos aquí
  </p>
  <Link href="/sorteos" className="editorial-button-secondary">
    Ver sorteos <span>→</span>
  </Link>
</div>
```

**Lista de boletos** — bloque con divisores hairline:

```tsx
<div className="grid gap-px bg-white/5 border border-white/[0.07]">
  {tickets.map((ticket) => {
    const status = resolveTicketStatus(ticket) // ver tabla abajo
    return (
      <article
        key={ticket.id}
        className="bg-[#0d0d0d] hover:bg-[#121212] transition-colors p-5 sm:p-6"
      >
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-40 h-24 overflow-hidden flex-shrink-0">
            <img
              src={ticket.raffles?.image_url || "/placeholder.svg"}
              alt={ticket.raffles?.title || "Sorteo"}
              className="w-full h-full object-cover transition-all"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="editorial-eyebrow mb-2 text-neutral-400">
              Boleto · #{ticket.ticket_number}
            </p>
            <h3 className="text-lg font-black text-white truncate mb-3">
              {ticket.raffles?.title}
            </h3>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs">
              <Cell label="Precio"   value={`$${ticket.raffles?.ticket_price.toFixed(2)}`} />
              <Cell label="Método"   value={methodLabel(ticket.payment_method)} />
              <Cell label="Comprado" value={fmtDate(ticket.purchased_at)} />
              <Cell label="Sorteo"   value={fmtDate(ticket.raffles?.draw_date)} />
            </dl>
          </div>

          <div className="flex md:flex-col items-start gap-3">
            <span className={status.badgeClass}>{status.label}</span>
            <Link
              href={`/raffle/${ticket.raffles?.id}`}
              className="text-xs font-semibold tracking-widest uppercase text-neutral-400 hover:text-white inline-flex items-center gap-2 group"
            >
              Ver sorteo <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </article>
    )
  })}
</div>
```

`Cell` es un helper interno que renderiza `<dt>` (label uppercase tracking-wider neutral-500) + `<dd>` (white font-semibold).

**Resolución de estado:**

| `raffles.status` | `payment_status` | label       | clase           |
|------------------|------------------|-------------|-----------------|
| `active`         | `completed`      | "Activo"    | `badge-success` |
| `active`         | `pending`        | "Pendiente" | `badge-warning` |
| `active`         | `failed`         | "Rechazado" | `badge-danger`  |
| `completed`      | *                | "Finalizado"| `badge-neutral` |
| `cancelled`      | *                | "Cancelado" | `badge-neutral` |

Nota: hoy `user-tickets.tsx` solo mira `raffles.status`. Aprovechamos para reflejar también `payment_status` (que ya viene en el ticket) — el usuario verá si su pago manual sigue pendiente.

`methodLabel`:

```ts
{
  card: "Tarjeta",
  bank_transfer: "Transferencia",
  paypal: "PayPal",
  crypto: "Crypto",
}
```

(La etiqueta `transfer` actual es incorrecta — el valor real en DB es `bank_transfer`. Se corrige.)

## 5. Sección — `/admin/*`

### 5.1 Shell `app/admin/layout.tsx`

Reemplaza el fondo gradiente `from-slate-950 via-blue-950 to-slate-950` por `bg-[#080808]`. La sidebar y la barra inferior móvil pasan al lenguaje editorial.

```tsx
<div className="flex min-h-screen bg-[#080808]">
  <aside className="hidden lg:block w-64 border-r border-white/[0.07] flex-shrink-0">
    <div className="px-6 pt-12 pb-8">
      <p className="editorial-eyebrow mb-3">Panel</p>
      <h2 className="text-2xl font-black text-white tracking-tight">Admin</h2>
    </div>
    <nav className="px-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-3 text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors text-sm font-semibold tracking-wider uppercase"
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  </aside>

  {/* Bottom nav móvil */}
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#080808] border-t border-white/[0.07] z-50">
    <nav className="flex items-center justify-around py-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center gap-1 px-3 py-2 text-neutral-500 hover:text-white transition-colors"
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[0.65rem] tracking-widest uppercase">
            {item.label.split(" ")[0]}
          </span>
        </Link>
      ))}
    </nav>
  </div>

  <main className="flex-1 pb-20 lg:pb-0 overflow-x-hidden">{children}</main>
</div>
```

Cambios clave: fuera el gradiente azul, fuera `backdrop-blur-xl`, fuera `rounded-xl` en el item activo. La sidebar es ahora una columna con divisor hairline, el item del menú destaca por hover sutil.

Nota: el item activo (ruta actual) recibe clases adicionales `text-white border-l-2 border-white pl-[10px]` (en lugar de `pl-3`) para mantener anclaje vertical sin caer en color de marca.

### 5.2 Encabezado de página común

Todas las páginas admin (`/admin`, `/admin/raffles`, `/admin/raffles/new`, `/admin/raffles/[id]`, `/admin/pending-payments`, `/admin/sales`, `/admin/settings`) reemplazan el patrón actual

```tsx
<h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">…</h1>
<p className="text-slate-400">…</p>
```

por

```tsx
<header className="mb-10" data-aos="fade-up">
  <p className="editorial-eyebrow mb-2">{eyebrow}</p>
  <h1 className="editorial-heading">{title}</h1>
  <p className="text-neutral-500 text-sm mt-3">{subtitle}</p>
</header>
```

Tabla de eyebrow/title por página:

| ruta                          | eyebrow         | title               |
|-------------------------------|-----------------|---------------------|
| `/admin`                      | Resumen         | Panel <span>Admin</span> |
| `/admin/raffles`              | Catálogo        | Gestión <span>Sorteos</span> |
| `/admin/raffles/new`          | Nuevo           | Crear <span>Sorteo</span> |
| `/admin/raffles/[id]`         | Edición         | Editar <span>Sorteo</span> |
| `/admin/pending-payments`     | Aprobaciones    | Pagos <span>Pendientes</span> |
| `/admin/sales`                | Historial       | <span>Ventas</span> |
| `/admin/settings`             | Plataforma      | <span>Configuración</span> |

El padding lateral del wrapper pasa a `px-4 sm:px-6` y el `py-` superior a `py-12 sm:py-16` (más compacto que dashboard porque el sidebar ya consume verticalidad).

### 5.3 `app/admin/page.tsx` (admin home)

- Botón "Crear Sorteo" en la cabecera pasa de `bg-gradient-to-r from-cyan-500 to-blue-600` a `editorial-button-primary` con icono `Plus`.
- Las **4 stat cards** usan el mismo patrón de `dashboard-stats.tsx` (`grid gap-px bg-white/5`, fondos `bg-[#080808]` y hover `bg-[#0d0d0d]`, halo blanco, eyebrow + headline `font-black`, separador inferior degradado a transparente). Iconos: `TrendingUp`, `Ticket`, `DollarSign`, `Users` — todos blancos.
- Los **3 quick links** ("Gestionar Sorteos", "Ver Ventas", "Configurar Pagos") pasan a una grilla `grid gap-px bg-white/5`. Cada uno: bloque `bg-[#080808] hover:bg-[#0d0d0d] p-8` con eyebrow + título `font-black` + descripción `text-neutral-500 text-sm` + flecha `→` que se mueve en hover.
- Lista "Sorteos Recientes": ya no es una `Card` glass con filas `rounded-xl`. Pasa al patrón `editorial-card` envolvente + filas como `<Link>` con divisor `border-b border-white/[0.07]` y hover `bg-[#121212]`. Cada fila: thumbnail 64×64 cuadrado, título, ratio vendidos/total como `text-neutral-500`, badge funcional a la derecha:
  - `active` → `badge-success` "Activo"
  - `completed` → `badge-neutral` "Finalizado"
  - `cancelled` → `badge-danger` "Cancelado"

### 5.4 `app/admin/raffles/page.tsx`

Cards de raffles pasan a `editorial-card` (sin rounded, sin glass). Estructura interna conservada (thumbnail + info + acciones), pero:

- Badge de estado: mapea a `badge-success` / `badge-neutral` / `badge-danger` según `active|completed|cancelled`. Adiós a las pillas `rounded-full`.
- Bloque "Ganador" (`from-yellow-500/10 to-orange-500/10 border border-yellow-500/20`): pasa a `border border-white/[0.07] bg-[#121212] p-4` con eyebrow `Ganador del sorteo`, sin gradiente. El `🏆` se conserva como ornamento.
- Botón "Editar" (`bg-cyan-500/20 text-cyan-400`): pasa a `editorial-button-secondary` (size compacto: `px-4 py-2 text-xs`).
- Padding compacto: `p-5 sm:p-6` en lugar de `p-4 sm:p-6` con extra de huecos. Imagen del raffle: `rounded-xl` → esquinas rectas, `w-32 h-32`.

`DrawWinnerButton` y `DeleteRaffleButton` se rediseñan en §5.10 / §5.11.

### 5.5 `app/admin/raffles/new` y `[id]`

- Header al patrón §5.2.
- En `[id]/page.tsx` las 3 stat cards (`Card className="glass-card"`): pasan al mismo patrón `gap-px bg-white/5`. Iconos `DollarSign` y `TrendingUp` van blancos, no `text-green-400` / `text-cyan-400`.
- `RaffleForm` → ver §5.9.

### 5.6 `app/admin/pending-payments/page.tsx`

Solo header. La lista vive en `pending-payments-list.tsx` (§5.7).

### 5.7 `components/pending-payments-list.tsx`

- Card del estado vacío: `editorial-card` con eyebrow `Aprobaciones` + headline + texto neutral-500. Icono `Clock` blanco con halo.
- Cada compra agrupada (`Card`): pasa a `editorial-card`. Sin `hover:border-cyan-500/50`, sin `backdrop-blur-xl`. Hover: `hover:bg-[#121212]`.
- Pills de números de boleto (`bg-cyan-500/20 text-cyan-400 rounded-full`): pasan a `border border-white/10 text-white px-2 py-0.5 font-mono text-xs` (esquinas rectas, sin color cyan).
- Total monto (`bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent`): pasa a `text-3xl font-black text-white` (sólido). El verde queda implícito en el botón Aprobar.
- Botón "Aprobar Pago" (`bg-gradient-to-r from-emerald-500 to-green-600`): pasa a `editorial-button-primary` (blanco sobre negro) con icono `CheckCircle2` en color `var(--color-state-success)`. Es decir, el botón es blanco; el icono colorea para reforzar el estado.
- Botón "Rechazar" (`border-red-500/50 text-red-400 hover:bg-red-500/10`): pasa a `editorial-button-danger`.
- Modal del comprobante: fondo `bg-black/95` (sin `backdrop-blur-sm`), botón cerrar `border border-white/20 hover:border-white p-2`, esquinas rectas en la imagen.
- Iconos meta (`User`, `Mail`, `Phone`, `CreditCard`): texto en `text-neutral-500`, ya no `text-slate-500`.

### 5.8 `components/sales-search-filter.tsx`

- Input de búsqueda: `editorial-input` con `pl-12` para el icono. Foco con borde blanco al 40%, no `focus:border-cyan-500`.
- Filtros (Todos / Completados / Pendientes): pasan de pills `rounded-lg` a "tabs" editoriales — texto uppercase tracking-widest + subrayado blanco al activo:
  ```tsx
  <Link className={isActive
    ? "border-b-2 border-white text-white pb-2 px-1 text-xs tracking-widest uppercase font-semibold"
    : "border-b-2 border-transparent text-neutral-500 hover:text-white pb-2 px-1 text-xs tracking-widest uppercase font-semibold transition-colors"} />
  ```
- Tabla: `editorial-card` envolvente. `<thead>` con fondo `bg-[#121212]` y borde inferior hairline. `<tbody>` filas con `hover:bg-[#121212]` y divisor `divide-y divide-white/[0.05]`. Padding por celda `px-5 py-4`.
- Encabezados de tabla (`<th>`): `text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400`.
- Celda Boleto: número en `text-white font-mono font-semibold` (sin cyan), hash en `text-neutral-500 text-xs font-mono`.
- Celda Cliente: nombre `text-white`, email `text-neutral-500`, phone `text-neutral-600`.
- Celda Método de pago (`bg-purple-500/20 text-purple-400` etc): pasa a un **badge neutral** uniforme `badge-neutral` (todos los métodos lucen igual). El método ya está como texto descriptivo; no hace falta diferenciarlos por color.
- Celda Precio (`text-emerald-400`): pasa a `text-white font-semibold` (el verde se reserva para estado, no para precio).
- Celda Estado: `payment_status` →
  - `completed` → `badge-success` "Completado"
  - `pending` → `badge-warning` "Pendiente"
  - `failed` → `badge-danger` "Fallido"
- Celda Fecha: `text-neutral-500`.
- Paginación: botones "Anterior"/"Siguiente" pasan a `editorial-button-secondary` compacto. Botones de número usan el patrón tabs editorial — activo con subrayado blanco, inactivo neutral-500.

### 5.9 `components/raffle-form.tsx`

- Wrapper externo `bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6` → `editorial-card p-6 sm:p-8`.
- Todos los inputs/textarea/select/`datetime-local` → clase `editorial-input`. Las labels `text-slate-300` → `editorial-eyebrow text-neutral-400 mb-2` (eyebrow uppercase tracking, no labels suaves).
- Helper text `text-slate-500` → `text-neutral-500 text-xs mt-1`.
- Drop-zone de imagen (`border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/30 hover:border-cyan-500/50`) → `border border-dashed border-white/15 hover:border-white/40 bg-[#121212]` (esquinas rectas), icono y texto en `text-neutral-400`/`text-neutral-500`.
- Botón eliminar imagen (`bg-red-500/80 hover:bg-red-600`) → `border border-white/20 hover:border-white p-2` con icono X blanco. La intención destructiva es contextual (botón sobre la imagen), no necesita color rojo cuando ya hay confirmación con SweetAlert.
- Botón submit (gradiente cyan→blue) → `editorial-button-primary`. Botón Cancelar → `editorial-button-secondary`.

### 5.10 `components/draw-winner-button.tsx`

Lectura rápida: hoy es un botón de acción primaria que dispara la selección de ganador. Mapeo:

- Estilos primarios coloridos → `editorial-button-primary`.
- Estado deshabilitado preserva `disabled:opacity-50`.
- Si tiene icono `Sparkles`/`Trophy`, queda blanco.

### 5.11 `components/delete-raffle-button.tsx`

- Estilos destructivos → `editorial-button-danger` (size compacto: `px-4 py-2 text-xs`).
- Icono `Trash2` color `var(--color-state-danger)`.

### 5.12 `components/bank-accounts-manager.tsx`, `payment-methods-manager.tsx`, `site-settings-manager.tsx`

Estos viven dentro de `<Card>` (shadcn) en la página de settings. Cambios:

- En `app/admin/settings/page.tsx`: las 4 `<Card>` shadcn (con `bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl` por defecto) se reemplazan por contenedores `<section className="editorial-card p-6 sm:p-8">`. Header de sección = eyebrow + headline `font-black` + descripción `text-neutral-500 text-sm`.
- Las "burbujas con gradiente" del icono de header (`bg-gradient-to-br from-purple-500 to-pink-600`, `from-cyan-500 to-blue-600`) se eliminan. Si se quiere icono, va al estilo landing: 12×12 con halo blanco blur-xl detrás.
- Bloque "Variables de Entorno": filas con divisor hairline. Indicadores `✓ Configurada` (verde) y `⚠ Verificar` (ámbar) usan `text-[var(--color-state-success)]` y `text-[var(--color-state-warning)]` respectivamente — consistente con la regla de color funcional para estados.
- En cada manager: inputs → `editorial-input`. Botones → `editorial-button-primary` / `editorial-button-secondary` / `editorial-button-danger` según rol. Cards/items internos → `editorial-card` con divisores hairline en lugar de `rounded-xl`.

### 5.13 `components/description-collapsible.tsx`

Si su tratamiento visual entra dentro de páginas admin (lo usa el detalle de raffle), se ajusta para:

- Botón "Ver más / Ver menos" → texto en `text-neutral-400 hover:text-white text-xs font-semibold tracking-widest uppercase` (mismo patrón que "Ver sorteos →" del landing).
- Sin colores de marca cyan/blue.

## 6. Cambios fuera de los componentes listados

- `app/globals.css`: añadir tokens (§3.1) y utilidades (§3.2). Las clases legacy `.glass-*`, `.progress-glow`, `.animate-shimmer` se conservan según §3.3 — no se borran porque rutas fuera del alcance las consumen.
- Las `--primary` / `--accent` actualmente apuntan a `212 175 55` (oro/ámbar) en `globals.css`. Aunque el área autenticada no lo usa decorativamente tras este redesign, **no se modifican esas vars** porque son consumidas por componentes shadcn fuera del alcance (botones default, focus rings de varios sitios). Se documenta como decisión consciente.

## 7. Lo que NO se cambia (no-goals)

- Lógica de negocio, server actions, queries Supabase, manejo de errores, mensajes de SweetAlert.
- Rutas, IDs de elementos, estructura de datos.
- Componentes públicos (`navbar.tsx`, `footer.tsx`, `whatsapp-bubble.tsx`, `raffle-card.tsx`, `hero-rotator.tsx`, `faq-section.tsx`, `verify-section.tsx`, `purchase-section.tsx`, `price-selector.tsx`, `guest-form.tsx`, los checkouts) — ya están en línea con la landing.
- `/auth/*` — fuera de alcance.
- `app/admin/loading.tsx` y `app/dashboard/loading.tsx` — si tienen estilos divergentes se incluyen en el plan, pero no requieren rediseño semántico.
- Mecánica de AOS, Tailwind v4, shadcn config — se mantienen.

## 8. Verificación

No hay test suite. Cada pantalla se verifica manualmente con `npm run dev`:

1. `/dashboard` con tickets y sin tickets, golden path: header + stats + lista coherentes con landing.
2. `/admin` (vista resumen): stats + quick links + sorteos recientes.
3. `/admin/raffles`: lista, badges de estado, botones (editar / draw / delete).
4. `/admin/raffles/new` y `/admin/raffles/[id]`: formulario completo, drop-zone de imagen, submit.
5. `/admin/pending-payments`: con compras agrupadas y vacías; modal del comprobante; flujo aprobar y rechazar.
6. `/admin/sales`: filtros, búsqueda, paginación, tabla densa.
7. `/admin/settings`: las cuatro secciones renderizan, indicadores de env vars con color funcional.
8. Navegación admin sidebar y bottom-nav móvil.
9. Cross-check visual con la landing (`/`) abierta en otra pestaña: tipografía, bordes, espaciado, paleta deben sentirse del mismo sistema.

Sin gradientes de color decorativos residuales en el alcance: el siguiente comando debe devolver vacío.

```bash
grep -rEn "from-(cyan|purple|emerald|pink|blue|orange|yellow)-|bg-clip-text|backdrop-blur-xl|slate-(950|900|800|700|400|300|200|100)" \
  app/dashboard app/admin \
  components/dashboard-stats.tsx components/user-tickets.tsx \
  components/pending-payments-list.tsx components/sales-search-filter.tsx \
  components/raffle-form.tsx components/bank-accounts-manager.tsx \
  components/payment-methods-manager.tsx components/site-settings-manager.tsx \
  components/draw-winner-button.tsx components/delete-raffle-button.tsx \
  components/description-collapsible.tsx
```

Excepción admitida: `bg-clip-text` puede aparecer dentro de un block de **código de ejemplo** (markdown del spec) — el grep es solo sobre `app/` y `components/`.

## 9. Riesgos y mitigaciones

- **Pérdida de escaneabilidad por monocromía**: mitigado por (a) badges funcionales en estados clave, (b) hairlines y divisores que estructuran la información, (c) tipografía editorial con jerarquía clara (eyebrow / headline / body). Si tras la implementación una pantalla operativa pierde claridad, se puede agregar más densidad de divisores o ajustar `tracking` del eyebrow — pero no reintroducir paletas decorativas.
- **Reuso de `.glass-*` fuera de alcance**: ya verificado vía grep que `auth/*`, `privacy`, `terms`, `not-found` y `crypto-checkout` siguen consumiendo estas clases. Por eso §3.3 las preserva en CSS. Si en una iteración futura se rediseñan esas rutas, se podrá borrar el bloque legacy.
- **shadcn `<Card>`**: hoy se importa en `app/admin/settings/page.tsx` y `app/admin/raffles/[id]/page.tsx`. Reemplazarlo por `<section className="editorial-card …">` pierde el wrapper semántico de shadcn pero alinea con el lenguaje. No hay funcionalidad asociada que romper (Card, CardHeader, CardContent son puramente presentacionales).
