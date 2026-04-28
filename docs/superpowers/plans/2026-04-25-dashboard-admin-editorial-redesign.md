# Rediseño editorial de `/dashboard` y `/admin/*` — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar `/dashboard` y todo `/admin/*` al lenguaje visual editorial monocromático de la landing, según el spec `2026-04-25-dashboard-admin-editorial-redesign-design.md`.

**Architecture:** Se introducen tokens y utilidades editoriales en `app/globals.css` (sin tocar las clases legacy `.glass-*`, que rutas fuera de alcance siguen consumiendo). Cada página/componente del alcance se reescribe para consumir esas utilidades, eliminando gradientes de color decorativos, glassmorphism y la paleta `slate-*`. El color funcional (verde/ámbar/rojo) solo aparece en badges de estado.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 (configurado en CSS via `@theme inline`) · shadcn/ui · lucide-react · AOS · SweetAlert2.

**No hay test suite.** Cada tarea termina con verificación manual: `npm run dev` + navegación a la pantalla afectada. Se commitea por tarea para mantener historia limpia.

---

## Mapa de archivos

**Modificados:**

- `app/globals.css` — añadir tokens y utilidades editoriales (Tarea 1)
- `app/dashboard/page.tsx` — header editorial (Tarea 2)
- `components/dashboard-stats.tsx` — grid hairline + iconos blancos (Tarea 3)
- `components/user-tickets.tsx` — lista densa + badges funcionales (Tarea 4)
- `app/admin/layout.tsx` — shell sin gradiente azul (Tarea 5)
- `app/admin/page.tsx` — admin home reescrita (Tarea 6)
- `app/admin/raffles/page.tsx` — listado de raffles editorial (Tarea 7)
- `components/delete-raffle-button.tsx` — botón danger editorial (Tarea 7)
- `components/draw-winner-button.tsx` — modal y botón editorial (Tarea 8)
- `app/admin/raffles/new/page.tsx` — header editorial (Tarea 9)
- `app/admin/raffles/[id]/page.tsx` — header + stats sin glass (Tarea 9)
- `components/raffle-form.tsx` — inputs y botones editoriales (Tarea 10)
- `app/admin/pending-payments/page.tsx` — header editorial (Tarea 11)
- `components/pending-payments-list.tsx` — cards densas + botones funcionales (Tarea 11)
- `app/admin/sales/page.tsx` — header + tabs editorial (Tarea 12)
- `components/sales-search-filter.tsx` — tabla densa + paginación tabs (Tarea 12)
- `app/admin/settings/page.tsx` — secciones sin shadcn Card (Tarea 13)
- `components/bank-accounts-manager.tsx` — sin slate, sin gradientes (Tarea 14)
- `components/payment-methods-manager.tsx` — sin gradientes coloridos (Tarea 15)
- `components/site-settings-manager.tsx` — botones editoriales (Tarea 16)

**Sin cambios** (ya alineados o fuera de alcance):

- `components/description-collapsible.tsx` — ya usa `border-white/5`, eyebrow uppercase tracking, neutral-400. Se incluye solo en la verificación final (Tarea 17).
- Componentes públicos (`navbar`, `footer`, `whatsapp-bubble`, `raffle-card`, `hero-rotator`, `faq-section`, `verify-section`, `purchase-section`, `price-selector`, `guest-form`, los checkouts).
- Rutas fuera de alcance: `/auth/*`, `/privacy`, `/terms`, `/not-found`, `app/raffle/[id]`, `app/sorteos`, `app/verify`.

---

## Tarea 1 — Sistema de diseño compartido (`globals.css`)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Añadir tokens al bloque `@theme inline`**

Insertar dentro del bloque `@theme inline { … }` (después de `--color-mid-gray: #737373;`, manteniendo el orden alfabético/lógico actual):

```css
  /* Editorial design tokens */
  --color-surface-0: #080808;
  --color-surface-1: #0d0d0d;
  --color-surface-2: #121212;
  --color-hairline: rgba(255, 255, 255, 0.07);
  --color-state-success: #22c55e;
  --color-state-warning: #f59e0b;
  --color-state-danger: #ef4444;
```

- [ ] **Step 2: Añadir utilidades editoriales después del bloque `.glass-*`**

Insertar al final del archivo (después de `.progress-glow { … }`, antes del `html { scroll-behavior: smooth; }`):

```css
/* Editorial design utilities (paired with /dashboard and /admin/* redesign).
   Landing-aligned: monochrome, sharp corners, hairline borders, no glass. */
.editorial-eyebrow {
  @apply text-xs font-semibold tracking-[0.3em] uppercase text-white;
}

.editorial-heading {
  @apply text-3xl sm:text-4xl font-black text-white tracking-tight;
}

.editorial-card {
  background-color: var(--color-surface-1);
  border: 1px solid var(--color-hairline);
}

.editorial-input {
  @apply w-full px-4 py-3 bg-[#121212] border border-white/[0.07]
         text-white placeholder:text-neutral-500
         focus:border-white/40 focus:outline-none transition-colors;
}

.editorial-button-primary {
  @apply inline-flex items-center justify-center gap-2
         bg-white text-black px-6 py-3
         text-sm font-semibold tracking-widest uppercase
         hover:bg-neutral-200 transition-colors disabled:opacity-50;
}

.editorial-button-secondary {
  @apply inline-flex items-center justify-center gap-2
         border border-white/20 hover:border-white text-white
         px-6 py-3 text-sm font-semibold tracking-widest uppercase
         hover:bg-white/[0.04] transition-colors disabled:opacity-50;
}

.editorial-button-danger {
  @apply inline-flex items-center justify-center gap-2
         border border-[#ef4444]/40 text-[#ef4444]
         hover:bg-[#ef4444]/10
         px-6 py-3 text-sm font-semibold tracking-widest uppercase
         transition-colors disabled:opacity-50;
}

.badge {
  @apply inline-flex items-center px-2.5 py-1
         text-[0.65rem] font-semibold tracking-[0.2em] uppercase;
}
.badge-success { @apply text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30; }
.badge-warning { @apply text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30; }
.badge-danger  { @apply text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30; }
.badge-neutral { @apply text-neutral-400 bg-white/[0.04] border border-white/10; }
```

Nota: las clases `.glass-card`, `.glass-button*`, `.glass-input`, `.progress-glow`, `.animate-shimmer` se **conservan** porque las consumen rutas fuera de alcance (`/auth/*`, `/privacy`, `/terms`, `/not-found`, `crypto-checkout`).

- [ ] **Step 3: Verificar que el dev server compila**

```bash
npm run dev
```

Abrir http://localhost:3000/. La landing debe seguir luciendo idéntica (no consume las nuevas utilidades aún). Si hay error de compilación de Tailwind, revisar la sintaxis del `@apply`.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(ui): add editorial design tokens and utilities"
```

---

## Tarea 2 — `/dashboard` page wrapper

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Reescribir `app/dashboard/page.tsx`**

Reemplazar el bloque `return ( … )` completo (líneas 42–60) por:

```tsx
  return (
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

        <DashboardStats
          totalTickets={tickets?.length || 0}
          activeTickets={activeTickets}
          totalSpent={totalSpent}
        />

        <section className="mt-16" data-aos="fade-up">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="editorial-eyebrow mb-2">Historial</p>
              <h2 className="editorial-heading">
                Mis <span className="text-white">Boletos</span>
              </h2>
            </div>
            <Link
              href="/sorteos"
              className="text-neutral-400 hover:text-white text-sm font-semibold tracking-widest uppercase flex items-center gap-2 group"
            >
              Ver sorteos
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <UserTickets tickets={tickets || []} />
        </section>
      </div>
    </div>
  )
```

- [ ] **Step 2: Añadir el import de `Link` al tope del archivo**

Insertar tras `import { UserTickets } from "@/components/user-tickets"`:

```tsx
import Link from "next/link"
```

- [ ] **Step 3: Verificar visualmente**

```bash
npm run dev
```

Iniciar sesión y navegar a http://localhost:3000/dashboard. Esperado:
- Fondo negro plano (no slate).
- Eyebrow blanco "TU CUENTA" arriba del headline.
- Headline `Mi Dashboard` blanco sólido (sin gradiente cyan→blue).
- Las stats y la lista de boletos quedarán **rotas/feas** todavía — eso se corrige en Tareas 3 y 4. Lo importante aquí es que el header y el wrapper rendericen sin error.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(dashboard): editorial header and wrapper"
```

---

## Tarea 3 — `dashboard-stats.tsx`

**Files:**
- Modify: `components/dashboard-stats.tsx`

- [ ] **Step 1: Reescribir el componente completo**

Reemplazar `components/dashboard-stats.tsx` íntegro:

```tsx
import { Ticket, Sparkles, Wallet } from "lucide-react"

interface DashboardStatsProps {
  totalTickets: number
  activeTickets: number
  totalSpent: number
}

export function DashboardStats({ totalTickets, activeTickets, totalSpent }: DashboardStatsProps) {
  const stats = [
    { label: "Boletos", title: "Total comprados", value: totalTickets.toString(), icon: Ticket },
    { label: "Sorteos", title: "Activos", value: activeTickets.toString(), icon: Sparkles },
    { label: "Inversión", title: "Total acumulado", value: `$${totalSpent.toFixed(2)}`, icon: Wallet },
  ]

  return (
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
  )
}
```

- [ ] **Step 2: Verificar visualmente**

Recargar `/dashboard`. Esperado:
- 3 tarjetas en fila (móvil: apiladas), separadas por hairlines blancas.
- Cada tarjeta: icono blanco con halo difuminado, eyebrow uppercase, valor grande blanco, descriptor neutral-500, divisor degradado abajo.
- Cero gradientes cyan/purple/green. El monto invertido es blanco sólido.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard-stats.tsx
git commit -m "feat(dashboard): monochrome stats grid with hairline separators"
```

---

## Tarea 4 — `user-tickets.tsx`

**Files:**
- Modify: `components/user-tickets.tsx`

- [ ] **Step 1: Reescribir el componente completo**

Reemplazar `components/user-tickets.tsx` íntegro:

```tsx
import Link from "next/link"

interface Ticket {
  id: string
  ticket_number: number
  payment_method: string
  payment_status: string
  purchased_at: string
  raffles: {
    id: string
    title: string
    image_url: string
    ticket_price: number
    draw_date: string
    status: string
  } | null
}

interface UserTicketsProps {
  tickets: Ticket[]
}

const METHOD_LABEL: Record<string, string> = {
  card: "Tarjeta",
  bank_transfer: "Transferencia",
  paypal: "PayPal",
  crypto: "Crypto",
}

function methodLabel(method: string) {
  return METHOD_LABEL[method] ?? method
}

function fmtDate(d: string | undefined) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-ES")
}

function resolveStatus(ticket: Ticket): { label: string; badgeClass: string } {
  const raffleStatus = ticket.raffles?.status
  const paymentStatus = ticket.payment_status

  if (raffleStatus === "cancelled") return { label: "Cancelado", badgeClass: "badge badge-neutral" }
  if (raffleStatus === "completed") return { label: "Finalizado", badgeClass: "badge badge-neutral" }
  if (paymentStatus === "pending") return { label: "Pendiente", badgeClass: "badge badge-warning" }
  if (paymentStatus === "failed") return { label: "Rechazado", badgeClass: "badge badge-danger" }
  return { label: "Activo", badgeClass: "badge badge-success" }
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-neutral-500 uppercase tracking-wider mb-0.5 text-[0.65rem]">{label}</dt>
      <dd className="text-white font-semibold">{value}</dd>
    </div>
  )
}

export function UserTickets({ tickets }: UserTicketsProps) {
  if (tickets.length === 0) {
    return (
      <div className="editorial-card p-12 text-center">
        <p className="editorial-eyebrow mb-3">Sin actividad</p>
        <h3 className="text-2xl font-black text-white mb-3">No tienes boletos todavía</h3>
        <p className="text-neutral-500 mb-6 text-sm">
          Participa en un sorteo para ver tus boletos aquí
        </p>
        <Link href="/sorteos" className="editorial-button-secondary">
          Ver sorteos
          <span>→</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-px bg-white/5 border border-white/[0.07]">
      {tickets.map((ticket) => {
        const status = resolveStatus(ticket)
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
                  className="w-full h-full object-cover"
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
                  <Cell label="Precio" value={`$${ticket.raffles?.ticket_price.toFixed(2) ?? "—"}`} />
                  <Cell label="Método" value={methodLabel(ticket.payment_method)} />
                  <Cell label="Comprado" value={fmtDate(ticket.purchased_at)} />
                  <Cell label="Sorteo" value={fmtDate(ticket.raffles?.draw_date)} />
                </dl>
              </div>

              <div className="flex md:flex-col items-start gap-3">
                <span className={status.badgeClass}>{status.label}</span>
                <Link
                  href={`/raffle/${ticket.raffles?.id}`}
                  className="text-xs font-semibold tracking-widest uppercase text-neutral-400 hover:text-white inline-flex items-center gap-2 group"
                >
                  Ver sorteo
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verificar visualmente**

Recargar `/dashboard`. Esperado:
- Lista de boletos con divisores hairline entre filas.
- Cada fila: thumbnail rectangular sin redondeo, eyebrow "BOLETO · #N", título grueso, 4 celdas de metadatos con etiquetas uppercase neutral-500, badge funcional (verde/ámbar/rojo/neutro) y enlace "Ver sorteo →".
- Sin Glass-Card, sin `rounded-2xl`, sin pills cyan.

Si el usuario no tiene boletos, el estado vacío debe mostrar eyebrow "SIN ACTIVIDAD" + headline + botón outline blanco.

- [ ] **Step 3: Commit**

```bash
git add components/user-tickets.tsx
git commit -m "feat(dashboard): editorial ticket list with functional status badges"
```

---

## Tarea 5 — Admin shell (`app/admin/layout.tsx`)

**Files:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Reemplazar el JSX retornado**

Sustituir el bloque `return ( … )` completo (líneas 35–72) por:

```tsx
  return (
    <div className="flex min-h-screen bg-[#080808]">
      <aside className="hidden lg:block w-64 border-r border-white/[0.07] flex-shrink-0">
        <div className="px-6 pt-12 pb-8">
          <p className="editorial-eyebrow mb-3">Panel</p>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin</h2>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-semibold tracking-widest uppercase"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

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
  )
```

Decisión: el "active state" del sidebar (resaltar la ruta actual) requiere conocer la URL — `usePathname` solo está disponible en client components. Para no convertir el layout en client (rompería su responsabilidad de auth gating), **no se implementa active state visual** en esta iteración. El hover ya da feedback. Esto es consistente con el comportamiento actual del layout (que tampoco lo tiene).

- [ ] **Step 2: Verificar visualmente**

Iniciar sesión como admin y navegar a http://localhost:3000/admin. Esperado:
- Fondo negro plano `#080808` en toda el área (sin gradiente azul).
- Sidebar de 256px con divisor vertical hairline a la derecha.
- Header del sidebar: eyebrow "PANEL" + headline `Admin` `font-black` blanco.
- Items de navegación: texto uppercase tracking-widest, neutral-400, hover blanco con leve `bg-white/[0.04]`.
- Bottom nav móvil (en viewport <1024px): mismo estilo, sin glass.
- El contenido (children) renderizará con sus estilos viejos hasta que se hagan las tareas 6+.

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat(admin): editorial shell with hairline sidebar"
```

---

## Tarea 6 — Admin home (`app/admin/page.tsx`)

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Ajustar imports**

Asegurar que estos imports están al tope del archivo (reemplazar el bloque actual de imports si es necesario):

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, DollarSign, Ticket, Users, TrendingUp } from "lucide-react"
```

- [ ] **Step 2: Reemplazar el `return ( … )`**

Sustituir el bloque `return ( … )` completo (líneas 53–185 del archivo original) por:

```tsx
  const recentRaffles = raffles?.slice(0, 5) ?? []

  const stats = [
    { label: "Sorteos", title: "Activos", value: activeRaffles.toString(), icon: TrendingUp },
    { label: "Boletos", title: "Vendidos", value: totalTicketsSold.toString(), icon: Ticket },
    { label: "Ingresos", title: "Total acumulado", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
    { label: "Usuarios", title: "Registrados", value: totalUsers.toString(), icon: Users },
  ]

  const quickLinks = [
    { href: "/admin/raffles", eyebrow: "Catálogo", title: "Gestionar Sorteos", body: "Ver, editar y eliminar sorteos existentes" },
    { href: "/admin/sales", eyebrow: "Historial", title: "Ver Ventas", body: "Historial completo de todas las ventas" },
    { href: "/admin/settings", eyebrow: "Plataforma", title: "Configurar Pagos", body: "Métodos de pago y configuración general" },
  ]

  function statusBadge(status: string) {
    if (status === "active") return { class: "badge badge-success", label: "Activo" }
    if (status === "completed") return { class: "badge badge-neutral", label: "Finalizado" }
    return { class: "badge badge-danger", label: "Cancelado" }
  }

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6" data-aos="fade-up">
          <header>
            <p className="editorial-eyebrow mb-2">Resumen</p>
            <h1 className="editorial-heading">
              Panel <span className="text-white">Admin</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-3">Gestiona sorteos, pagos y estadísticas</p>
          </header>
          <Link href="/admin/raffles/new" className="editorial-button-primary">
            <Plus className="w-4 h-4" />
            Crear Sorteo
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 mb-12">
          {stats.map(({ label, title, value, icon: Icon }, i) => (
            <div
              key={label}
              className="bg-[#080808] p-8 group hover:bg-[#0d0d0d] transition-colors"
              data-aos="fade-up"
              data-aos-delay={i * 75}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 mb-12">
          {quickLinks.map(({ href, eyebrow, title, body }, i) => (
            <Link
              key={href}
              href={href}
              className="bg-[#080808] hover:bg-[#0d0d0d] p-8 group transition-colors"
              data-aos="fade-up"
              data-aos-delay={i * 75}
            >
              <p className="editorial-eyebrow mb-3">{eyebrow}</p>
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-3">
                {title}
                <span className="text-neutral-600 group-hover:text-white transition-colors group-hover:translate-x-1 inline-block">→</span>
              </h3>
              <p className="text-neutral-500 text-sm">{body}</p>
            </Link>
          ))}
        </div>

        <section className="editorial-card" data-aos="fade-up">
          <div className="px-6 sm:px-8 py-5 border-b border-white/[0.07]">
            <p className="editorial-eyebrow mb-1">Catálogo</p>
            <h2 className="text-xl font-black text-white">Sorteos Recientes</h2>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {recentRaffles.length === 0 ? (
              <p className="px-6 sm:px-8 py-8 text-neutral-500 text-sm">No hay sorteos creados aún.</p>
            ) : (
              recentRaffles.map((raffle) => {
                const badge = statusBadge(raffle.status)
                return (
                  <Link
                    key={raffle.id}
                    href={`/admin/raffles/${raffle.id}`}
                    className="flex items-center gap-4 px-6 sm:px-8 py-4 hover:bg-[#121212] transition-colors"
                  >
                    <img
                      src={raffle.image_url || "/placeholder.svg"}
                      alt={raffle.title}
                      className="w-16 h-16 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{raffle.title}</h3>
                      <p className="text-xs text-neutral-500">
                        {raffle.tickets_sold} / {raffle.total_tickets} vendidos
                      </p>
                    </div>
                    <span className={badge.class}>{badge.label}</span>
                  </Link>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
```

- [ ] **Step 3: Verificar visualmente**

Recargar `/admin`. Esperado:
- Header editorial: eyebrow "RESUMEN" + headline `Panel Admin` con botón "CREAR SORTEO" blanco a la derecha.
- 4 stat cards en grid hairline (sin glass, sin gradientes).
- 3 quick links en grid hairline con flecha `→`.
- Sección "Sorteos Recientes": editorial-card con divider header + filas con thumbnail cuadrado y badge funcional a la derecha.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): editorial home with monochrome stats and quick links"
```

---

## Tarea 7 — `/admin/raffles` listado + delete-raffle-button

**Files:**
- Modify: `app/admin/raffles/page.tsx`
- Modify: `components/delete-raffle-button.tsx`

- [ ] **Step 1: Reescribir `app/admin/raffles/page.tsx`**

Reemplazar el `return ( … )` completo (líneas 41–166) por:

```tsx
  function statusBadge(status: string) {
    if (status === "active") return { class: "badge badge-success", label: "Activo" }
    if (status === "completed") return { class: "badge badge-neutral", label: "Finalizado" }
    return { class: "badge badge-danger", label: "Cancelado" }
  }

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6" data-aos="fade-up">
          <header>
            <p className="editorial-eyebrow mb-2">Catálogo</p>
            <h1 className="editorial-heading">
              Gestión <span className="text-white">Sorteos</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-3">Crea, edita y elimina sorteos</p>
          </header>
          <Link href="/admin/raffles/new" className="editorial-button-primary">
            <Plus className="w-4 h-4" />
            Crear Sorteo
          </Link>
        </div>

        <div className="space-y-4">
          {raffles?.map((raffle) => {
            const badge = statusBadge(raffle.status)
            return (
              <article key={raffle.id} className="editorial-card p-5 sm:p-6" data-aos="fade-up">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <img
                    src={raffle.image_url || "/placeholder.svg"}
                    alt={raffle.title}
                    className="w-full sm:w-32 h-48 sm:h-32 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="editorial-eyebrow mb-1 text-neutral-400">Sorteo</p>
                        <h3 className="text-lg sm:text-xl font-black text-white mb-1">{raffle.title}</h3>
                        <p className="text-neutral-500 text-xs sm:text-sm line-clamp-2">{raffle.description}</p>
                      </div>
                      <span className={badge.class}>{badge.label}</span>
                    </div>

                    {raffle.status === "completed" && raffle.winner_ticket && (
                      <div className="mt-4 mb-4 p-4 bg-[#121212] border border-white/[0.07]">
                        <p className="editorial-eyebrow mb-3 text-neutral-400">Ganador del sorteo</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Nombre</p>
                            <p className="text-white font-semibold">
                              {raffle.winner_ticket.user?.full_name || raffle.winner_ticket.guest_name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Email</p>
                            <p className="text-white font-semibold truncate">
                              {raffle.winner_ticket.user?.email || raffle.winner_ticket.guest_email || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Boleto</p>
                            <p className="text-white font-mono font-bold">
                              #{raffle.winner_ticket.ticket_number.toString().padStart(4, "0")}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Código</p>
                            <p className="text-white font-mono text-xs">{raffle.winner_ticket.ticket_hash}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider mb-1">Precio</p>
                        <p className="text-white font-semibold">${raffle.ticket_price}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider mb-1">Vendidos</p>
                        <p className="text-white font-semibold">
                          {raffle.tickets_sold} / {raffle.total_tickets}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider mb-1">Progreso</p>
                        <p className="text-white font-semibold">
                          {((raffle.tickets_sold / raffle.total_tickets) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-5">
                      <Link
                        href={`/admin/raffles/${raffle.id}`}
                        className="editorial-button-secondary px-4 py-2 text-xs"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Link>
                      <DrawWinnerButton
                        raffleId={raffle.id}
                        raffleStatus={raffle.status}
                        ticketsSold={raffle.tickets_sold}
                        totalTickets={raffle.total_tickets}
                      />
                      <DeleteRaffleButton raffleId={raffle.id} />
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
```

- [ ] **Step 2: Reescribir `components/delete-raffle-button.tsx`**

Reemplazar `components/delete-raffle-button.tsx` íntegro:

```tsx
"use client"

import { useState } from "react"
import { deleteRaffle } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { swal } from "@/lib/swal"

export function DeleteRaffleButton({ raffleId }: { raffleId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const ok = await swal.confirm(
      "¿Eliminar este sorteo?",
      "Esta acción no se puede deshacer y eliminará todos los boletos asociados.",
      "Sí, eliminar",
      "Cancelar",
    )
    if (!ok) return

    setLoading(true)
    try {
      const result = await deleteRaffle(raffleId)
      if (result?.error) {
        swal.error("No se pudo eliminar", result.error)
        return
      }
      swal.success("Sorteo eliminado")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error deleting raffle:", err)
      swal.error("No se pudo eliminar", err?.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="editorial-button-danger px-4 py-2 text-xs"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  )
}
```

- [ ] **Step 3: Verificar visualmente**

Navegar a `/admin/raffles`. Esperado:
- Header editorial.
- Cada raffle: card sin redondeo, eyebrow "SORTEO", título grueso, badge funcional a la derecha, datos en grid de 3 con etiquetas uppercase.
- Si hay raffle completado con ganador: panel interno `#121212` con eyebrow "GANADOR DEL SORTEO" + 4 datos.
- Botón "EDITAR" outline blanco compacto, "ELIMINAR" outline rojo compacto. (El botón draw lo arreglamos en Tarea 8.)

- [ ] **Step 4: Commit**

```bash
git add app/admin/raffles/page.tsx components/delete-raffle-button.tsx
git commit -m "feat(admin): editorial raffle list and delete button"
```

---

## Tarea 8 — `draw-winner-button.tsx`

**Files:**
- Modify: `components/draw-winner-button.tsx`

- [ ] **Step 1: Reescribir el componente completo**

Reemplazar `components/draw-winner-button.tsx` íntegro:

```tsx
"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Trophy, Loader2, X } from "lucide-react"
import { selectWinner, selectWinnerManual } from "@/app/actions/lottery"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"

interface DrawWinnerButtonProps {
  raffleId: string
  raffleStatus: string
  ticketsSold: number
  totalTickets: number
}

export function DrawWinnerButton({ raffleId, raffleStatus, ticketsSold, totalTickets }: DrawWinnerButtonProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [manualTicketNumber, setManualTicketNumber] = useState("")
  const router = useRouter()

  const canDraw = raffleStatus === "active" && ticketsSold > 0

  const closeModal = () => {
    setShowModal(false)
    setManualTicketNumber("")
  }

  const handleRandomDraw = async () => {
    setShowModal(false)

    const confirmed = await swal.confirm(
      "¿Sorteo Aleatorio?",
      "",
      `
        <div class="text-left space-y-3">
          <p class="text-neutral-300">Se seleccionará un boleto de forma aleatoria.</p>
          <p class="text-neutral-300">Boletos vendidos: <span class="text-white font-bold">${ticketsSold}/${totalTickets}</span></p>
          <p class="text-[#ef4444] font-semibold">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
    )

    if (!confirmed) return

    setIsDrawing(true)
    swal.loading("Realizando sorteo aleatorio...")

    try {
      const result = await selectWinner(raffleId)
      await swal.success(
        "🎉 ¡Sorteo completado!",
        `Boleto ganador: #${result.winner.ticket_number.toString().padStart(4, "0")}\n\nSe ha notificado al ganador por email`,
        5000,
      )
      router.refresh()
    } catch (error: any) {
      swal.error("Error en el sorteo", error.message)
    } finally {
      setIsDrawing(false)
    }
  }

  const handleManualDraw = async () => {
    if (!manualTicketNumber.trim()) {
      swal.error("Error", "Por favor ingresa un número de boleto")
      return
    }

    const ticketNum = parseInt(manualTicketNumber)
    if (isNaN(ticketNum) || ticketNum < 1 || ticketNum > totalTickets) {
      swal.error("Error", `El número debe estar entre 1 y ${totalTickets}`)
      return
    }

    setShowModal(false)

    const confirmed = await swal.confirm(
      "¿Sorteo Manual?",
      "",
      `
        <div class="text-left space-y-3">
          <p class="text-neutral-300">Número de boleto seleccionado: <span class="text-white font-bold">#${ticketNum.toString().padStart(4, "0")}</span></p>
          <p class="text-neutral-300">Verifica que este sea el número correcto según la lotería.</p>
          <p class="text-[#ef4444] font-semibold">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
    )

    if (!confirmed) return

    setIsDrawing(true)
    swal.loading("Finalizando sorteo...")

    try {
      const result = await selectWinnerManual(raffleId, ticketNum)
      await swal.success(
        "🎉 ¡Sorteo completado!",
        `Boleto ganador: #${result.winner.ticket_number.toString().padStart(4, "0")}\n\nSe ha notificado al ganador por email`,
        5000,
      )
      setManualTicketNumber("")
      router.refresh()
    } catch (error: any) {
      swal.error("Error en el sorteo", error.message)
    } finally {
      setIsDrawing(false)
    }
  }

  const modalContent = showModal ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
      <div className="relative editorial-card p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="editorial-eyebrow mb-2">Finalizar</p>
        <h2 className="text-xl font-black text-white mb-2">Seleccionar método</h2>
        <p className="text-neutral-500 text-sm mb-6">Elige cómo deseas finalizar el sorteo.</p>

        <div className="space-y-4">
          <div className="border border-white/[0.07] p-4">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Opción 1</p>
            <p className="text-white font-semibold mb-1">Sorteo aleatorio</p>
            <p className="text-neutral-500 text-xs mb-4">Se seleccionará un boleto al azar.</p>
            <button
              onClick={handleRandomDraw}
              disabled={isDrawing}
              className="editorial-button-primary w-full px-4 py-2 text-xs"
            >
              Realizar aleatorio
            </button>
          </div>

          <div className="border border-white/[0.07] p-4">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Opción 2</p>
            <p className="text-white font-semibold mb-1">Sorteo manual</p>
            <p className="text-neutral-500 text-xs mb-3">Ingresa el número del boleto ganador.</p>
            <input
              type="number"
              value={manualTicketNumber}
              onChange={(e) => setManualTicketNumber(e.target.value)}
              placeholder={`Entre 1 y ${totalTickets}`}
              min="1"
              max={totalTickets}
              className="editorial-input mb-3"
            />
            <button
              onClick={handleManualDraw}
              disabled={isDrawing || !manualTicketNumber.trim()}
              className="editorial-button-secondary w-full px-4 py-2 text-xs"
            >
              Confirmar manual
            </button>
          </div>

          <button
            onClick={closeModal}
            className="w-full text-neutral-400 hover:text-white text-xs font-semibold tracking-widest uppercase py-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canDraw || isDrawing}
        className="editorial-button-primary px-4 py-2 text-xs"
      >
        {isDrawing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Trophy className="w-4 h-4" />
            Realizar sorteo
          </>
        )}
      </button>

      {typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  )
}
```

- [ ] **Step 2: Verificar visualmente**

En `/admin/raffles`, sobre un raffle activo con tickets vendidos:
- Botón "REALIZAR SORTEO" blanco sobre negro, compacto.
- Click → modal monocromo con eyebrow "FINALIZAR" + headline + dos opciones en cajas hairline.
- Input de boleto manual usa `editorial-input` (foco con borde blanco al 40%).
- SweetAlert sigue funcionando (no hay cambios en `lib/swal.ts`).

Si el raffle ya está completado o sin tickets, el botón debe verse deshabilitado (`opacity-50`).

- [ ] **Step 3: Commit**

```bash
git add components/draw-winner-button.tsx
git commit -m "feat(admin): editorial draw winner button and modal"
```

---

## Tarea 9 — `/admin/raffles/new` y `/admin/raffles/[id]` headers

**Files:**
- Modify: `app/admin/raffles/new/page.tsx`
- Modify: `app/admin/raffles/[id]/page.tsx`

- [ ] **Step 1: Reescribir `app/admin/raffles/new/page.tsx`**

Reemplazar el `return ( … )` (líneas 22–35) por:

```tsx
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-10" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Nuevo</p>
          <h1 className="editorial-heading">
            Crear <span className="text-white">Sorteo</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Completa los detalles del sorteo</p>
        </header>

        <RaffleForm />
      </div>
    </div>
  )
```

- [ ] **Step 2: Reescribir `app/admin/raffles/[id]/page.tsx`**

a) Eliminar el import `import { Card } from "@/components/ui/card"` (ya no se usa).

b) Reemplazar el `return ( … )` (líneas 57–104) por:

```tsx
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-10" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Edición</p>
          <h1 className="editorial-heading">
            Editar <span className="text-white">Sorteo</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Modifica los detalles del sorteo</p>
        </header>

        <div className="grid md:grid-cols-3 gap-px bg-white/5 mb-10">
          <div className="bg-[#080808] p-6 group hover:bg-[#0d0d0d] transition-colors">
            <div className="w-10 h-10 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 blur-xl rounded-full bg-white/10 opacity-60 group-hover:opacity-100 transition-opacity" />
              <DollarSign className="w-5 h-5 relative z-10 text-white" />
            </div>
            <p className="editorial-eyebrow mb-2">Ingresos</p>
            <p className="text-3xl font-black text-white mb-1">${totalRevenue.toFixed(2)}</p>
            <p className="text-neutral-500 text-sm">{raffle?.tickets_sold || 0} boletos vendidos</p>
          </div>

          <div className="bg-[#080808] p-6 group hover:bg-[#0d0d0d] transition-colors">
            <div className="w-10 h-10 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 blur-xl rounded-full bg-white/10 opacity-60 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="w-5 h-5 relative z-10 text-white" />
            </div>
            <p className="editorial-eyebrow mb-2">Pendientes</p>
            <p className="text-3xl font-black text-white mb-1">
              ${(pendingRevenue * (raffle?.ticket_price || 0)).toFixed(2)}
            </p>
            <p className="text-neutral-500 text-sm">{pendingRevenue} pagos por confirmar</p>
          </div>

          <div className="bg-[#080808] p-6">
            <p className="editorial-eyebrow mb-3">Métodos</p>
            <div className="space-y-2">
              {Object.entries(revenueByMethod || {}).map(([method, count]) => (
                <div key={method} className="flex justify-between items-baseline border-b border-white/[0.07] pb-1.5 last:border-b-0 last:pb-0">
                  <span className="text-neutral-400 text-xs uppercase tracking-wider capitalize">{method.replace("_", " ")}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(revenueByMethod || {}).length === 0 && (
                <p className="text-neutral-500 text-sm">Sin ventas aún</p>
              )}
            </div>
          </div>
        </div>

        <RaffleForm raffle={raffle} />
      </div>
    </div>
  )
```

- [ ] **Step 3: Verificar visualmente**

Navegar a `/admin/raffles/new` y a `/admin/raffles/<un id existente>`. Esperado:
- Headers editoriales (eyebrow + headline).
- En `[id]`: 3 stat cards en grid hairline (ingresos / pendientes / métodos), todas blancas sin gradientes.
- El `RaffleForm` aún se ve viejo (slate, gradiente cyan→blue) — eso lo arreglamos en Tarea 10.

- [ ] **Step 4: Commit**

```bash
git add app/admin/raffles/new/page.tsx app/admin/raffles/[id]/page.tsx
git commit -m "feat(admin): editorial headers on raffle new/edit pages"
```

---

## Tarea 10 — `raffle-form.tsx`

**Files:**
- Modify: `components/raffle-form.tsx`

- [ ] **Step 1: Reescribir el bloque `return ( … )`**

Reemplazar todo el `return ( … )` (líneas 111–279) por:

```tsx
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="editorial-card p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Título</label>
            <input
              type="text"
              name="title"
              defaultValue={raffle?.title}
              required
              className="editorial-input"
              placeholder="Ej: iPhone 15 Pro Max"
            />
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Descripción</label>
            <textarea
              name="description"
              defaultValue={raffle?.description}
              required
              rows={4}
              className="editorial-input"
              placeholder="Descripción detallada del premio"
            />
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Imagen del sorteo</label>

            {imagePreview ? (
              <div className="relative w-full h-64 overflow-hidden border border-white/[0.07]">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 border border-white/20 hover:border-white bg-black/60 transition-colors"
                  aria-label="Quitar imagen"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border border-dashed border-white/15 hover:border-white/40 bg-[#121212] flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-neutral-500 mb-3" />
                <p className="text-neutral-400 text-sm mb-1">Click para subir una imagen</p>
                <p className="text-neutral-500 text-xs">PNG, JPG, WEBP (máx. 5MB)</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Precio del boleto ($)</label>
              <input
                type="number"
                name="ticket_price"
                defaultValue={raffle?.ticket_price}
                required
                min="0.01"
                step="0.01"
                className="editorial-input"
                placeholder="5.00"
              />
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Total de boletos</label>
              <input
                type="number"
                name="total_tickets"
                defaultValue={raffle?.total_tickets}
                required
                min="1"
                className="editorial-input"
                placeholder="10000"
              />
            </div>
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Mínimo por compra</label>
            <input
              type="number"
              name="min_tickets_per_purchase"
              defaultValue={raffle?.min_tickets_per_purchase || 1}
              required
              min="1"
              className="editorial-input"
              placeholder="1"
            />
            <p className="text-neutral-500 text-xs mt-2">
              Los usuarios no podrán comprar menos de esta cantidad. El máximo será el total de boletos disponibles.
            </p>
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Opciones de talla (opcional)</label>
            <p className="text-neutral-500 text-xs mb-3">
              Si el premio requiere talla (ropa, calzado), ingresa las opciones separadas por coma. Ej: XS, S, M, L, XL
            </p>
            <textarea
              name="size_options"
              defaultValue={Array.isArray(raffle?.size_options) ? raffle.size_options.join(", ") : raffle?.size_options || ""}
              rows={2}
              className="editorial-input"
              placeholder="XS, S, M, L, XL, XXL"
            />
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Fecha del sorteo</label>
            <input
              type="datetime-local"
              name="draw_date"
              defaultValue={raffle?.draw_date?.slice(0, 16)}
              required
              className="editorial-input"
            />
          </div>

          {raffle && (
            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Estado</label>
              <select name="status" defaultValue={raffle?.status} className="editorial-input">
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading || uploadingImage} className="editorial-button-primary flex-1">
              {uploadingImage ? "Subiendo imagen..." : loading ? "Guardando..." : raffle ? "Actualizar sorteo" : "Crear sorteo"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading || uploadingImage}
              className="editorial-button-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  )
```

- [ ] **Step 2: Limpiar imports no usados**

Eliminar el import `import { Button } from "@/components/ui/button"` al tope (ya no se usa). Mantener `X` y `ImageIcon` de lucide-react.

- [ ] **Step 3: Verificar visualmente**

Navegar a `/admin/raffles/new`. Esperado:
- Form en `editorial-card` (sin glass, sin redondeo).
- Labels uppercase tracking neutral-400.
- Inputs/textarea/select monocromos con borde hairline; foco con borde blanco al 40%.
- Drop-zone de imagen con borde dashed blanco al 15%.
- Botones submit/cancel editoriales.

Probar el flujo de subir imagen y crear sorteo — la lógica no se tocó.

- [ ] **Step 4: Commit**

```bash
git add components/raffle-form.tsx
git commit -m "feat(admin): editorial raffle form inputs and buttons"
```

---

## Tarea 11 — `/admin/pending-payments` + `pending-payments-list.tsx`

**Files:**
- Modify: `app/admin/pending-payments/page.tsx`
- Modify: `components/pending-payments-list.tsx`

- [ ] **Step 1: Reescribir el header de `app/admin/pending-payments/page.tsx`**

Reemplazar el `return ( … )` final (líneas 77–91) por:

```tsx
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-10" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Aprobaciones</p>
          <h1 className="editorial-heading">
            Pagos <span className="text-white">Pendientes</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Verifica y aprueba transferencias bancarias pendientes</p>
        </header>

        <PendingPaymentsList purchases={purchasesList} />
      </div>
    </div>
  )
```

- [ ] **Step 2: Reescribir `components/pending-payments-list.tsx`**

Reemplazar todo el archivo:

```tsx
"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Clock, User, Mail, Phone, CreditCard, Eye, X, ImageOff } from "lucide-react"
import { approveGroupPayment, rejectGroupPayment } from "@/app/actions/payments"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"

interface GroupedPurchase {
  id: string
  tickets: Array<{
    id: string
    ticket_number: number
    ticket_hash: string
  }>
  raffle: {
    id: string
    title: string
    ticket_price: number
  }
  guest_name: string
  guest_email: string
  guest_phone: string
  bank_reference: string
  screenshot_url: string | null
  purchased_at: string
}

export function PendingPaymentsList({ purchases }: { purchases: GroupedPurchase[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Set<string>>(new Set())
  const [removedPurchases, setRemovedPurchases] = useState<Set<string>>(new Set())

  const filteredPurchases = purchases.filter((group) => !removedPurchases.has(group.id))

  const handleApprove = async (group: GroupedPurchase) => {
    const n = group.tickets.length
    const ok = await swal.confirm(
      `¿Aprobar ${n} boleto${n > 1 ? "s" : ""}?`,
      `Compra de ${group.guest_name} (${group.guest_email}) — Sorteo "${group.raffle.title}"`,
      "Sí, aprobar",
      "Cancelar",
    )
    if (!ok) return

    setProcessing(group.id)
    swal.loading("Aprobando pago...")

    try {
      const result = await approveGroupPayment(group.tickets.map((t) => t.id))
      if (result.error) {
        swal.error("Error al aprobar", result.error)
        return
      }
      swal.success(
        "Pago aprobado",
        `${result.updatedCount ?? n} boleto${(result.updatedCount ?? n) > 1 ? "s" : ""} confirmado${(result.updatedCount ?? n) > 1 ? "s" : ""}`,
      )
      setRemovedPurchases((prev) => new Set(prev).add(group.id))
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error approving payment:", error)
      swal.error("Error al aprobar", error.message || "Error al aprobar pago")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (group: GroupedPurchase) => {
    const n = group.tickets.length
    const ok = await swal.confirm(
      `¿Rechazar ${n} boleto${n > 1 ? "s" : ""}?`,
      `Esta acción eliminará los boletos de ${group.guest_name}. No se puede deshacer.`,
      "Sí, rechazar",
      "Cancelar",
    )
    if (!ok) return

    setProcessing(group.id)
    swal.loading("Rechazando pago...")

    try {
      const result = await rejectGroupPayment(group.tickets.map((t) => t.id))
      if (result.error) {
        swal.error("Error al rechazar", result.error)
        return
      }
      swal.success(
        "Pago rechazado",
        `${result.deletedCount ?? n} boleto${(result.deletedCount ?? n) > 1 ? "s" : ""} eliminado${(result.deletedCount ?? n) > 1 ? "s" : ""}`,
      )
      setRemovedPurchases((prev) => new Set(prev).add(group.id))
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error rejecting payment:", error)
      swal.error("Error al rechazar", error.message || "Error al rechazar pago")
    } finally {
      setProcessing(null)
    }
  }

  if (filteredPurchases.length === 0) {
    return (
      <div className="editorial-card p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center relative">
          <div className="absolute inset-0 blur-xl rounded-full bg-white/10" />
          <Clock className="w-6 h-6 relative z-10 text-white" />
        </div>
        <p className="editorial-eyebrow mb-3">Aprobaciones</p>
        <h3 className="text-2xl font-black text-white mb-3">No hay pagos pendientes</h3>
        <p className="text-neutral-500 text-sm">Las transferencias bancarias por aprobar aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredPurchases.map((group) => {
          const totalAmount = group.raffle.ticket_price * group.tickets.length
          return (
            <article key={group.id} className="editorial-card p-6 hover:bg-[#121212] transition-colors">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {group.screenshot_url && !imageError.has(group.screenshot_url) ? (
                    <button
                      onClick={() => setSelectedScreenshot(group.screenshot_url)}
                      className="w-full aspect-video bg-[#121212] overflow-hidden border border-white/[0.07] hover:border-white/30 transition-colors group relative"
                    >
                      <img
                        src={`/api/image-proxy?url=${encodeURIComponent(group.screenshot_url)}`}
                        alt="Comprobante"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImageError((prev) => new Set(prev).add(group.screenshot_url || ""))
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-full aspect-video bg-[#121212] border border-white/[0.07] flex flex-col items-center justify-center">
                      <ImageOff className="w-6 h-6 text-neutral-600 mb-2" />
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Sin comprobante</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1 space-y-4">
                  <div>
                    <p className="editorial-eyebrow mb-1 text-neutral-400">Sorteo</p>
                    <h3 className="text-lg font-black text-white">{group.raffle.title}</h3>
                  </div>

                  <div>
                    <p className="editorial-eyebrow mb-2 text-neutral-400">
                      Boletos · {group.tickets.length}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {group.tickets.map((t) => (
                        <span
                          key={t.id}
                          className="border border-white/10 text-white px-2 py-0.5 font-mono text-xs"
                        >
                          #{t.ticket_number.toString().padStart(4, "0")}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-white truncate">{group.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-300 truncate">{group.guest_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-300">{group.guest_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-300">Ref: {group.bank_reference || "Sin referencia"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 uppercase tracking-wider">
                    {new Date(group.purchased_at).toLocaleDateString("es", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="md:col-span-1 flex flex-col justify-between gap-4">
                  <div className="text-right">
                    <p className="editorial-eyebrow mb-1 text-neutral-400">Total</p>
                    <p className="text-3xl font-black text-white">${totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {group.tickets.length} × ${group.raffle.ticket_price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(group)}
                      disabled={processing === group.id}
                      className="editorial-button-primary"
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                      {processing === group.id ? "Procesando..." : "Aprobar pago"}
                    </button>
                    <button
                      onClick={() => handleReject(group)}
                      disabled={processing === group.id}
                      className="editorial-button-danger"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-12 right-0 border border-white/20 hover:border-white p-2 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={`/api/image-proxy?url=${encodeURIComponent(selectedScreenshot)}`}
              alt="Comprobante de transferencia"
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verificar visualmente**

Navegar a `/admin/pending-payments`. Esperado:
- Header editorial.
- Cuando hay pagos: cards en `editorial-card`, sin glass, sin redondeo. Pills de número de boleto monocromas. Total blanco grande. Botón "APROBAR PAGO" blanco con check verde, "RECHAZAR" outline rojo.
- Estado vacío: card con eyebrow "APROBACIONES" + headline + texto.
- Modal del comprobante: fondo `bg-black/95` (sin blur azul), botón cerrar outline blanco.

Probar aprobar y rechazar (en un dato dummy si está disponible). La lógica swal sigue funcional.

- [ ] **Step 4: Commit**

```bash
git add app/admin/pending-payments/page.tsx components/pending-payments-list.tsx
git commit -m "feat(admin): editorial pending payments list"
```

---

## Tarea 12 — `/admin/sales` + `sales-search-filter.tsx`

**Files:**
- Modify: `app/admin/sales/page.tsx`
- Modify: `components/sales-search-filter.tsx`

- [ ] **Step 1: Reescribir `app/admin/sales/page.tsx`**

Reemplazar el `return ( … )` (líneas 88–123) por:

```tsx
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-8" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Historial</p>
          <h1 className="editorial-heading">
            <span className="text-white">Ventas</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">
            Total de ventas: {totalCount || 0} · Ingresos: ${totalRevenue.toFixed(2)}
          </p>
        </header>

        <div className="flex gap-6 mb-8 border-b border-white/[0.07]">
          {[
            { value: "all", label: "Todos" },
            { value: "completed", label: "Completados" },
            { value: "pending", label: "Pendientes" },
          ].map((filter) => {
            const isActive = statusFilter === filter.value
            return (
              <Link
                key={filter.value}
                href={`/admin/sales?status=${filter.value}`}
                className={
                  isActive
                    ? "border-b-2 border-white text-white pb-3 px-1 text-xs tracking-widest uppercase font-semibold"
                    : "border-b-2 border-transparent text-neutral-500 hover:text-white pb-3 px-1 text-xs tracking-widest uppercase font-semibold transition-colors"
                }
              >
                {filter.label}
              </Link>
            )
          })}
        </div>

        <SalesSearchFilter tickets={tickets || []} totalCount={totalCount || 0} />
      </div>
    </div>
  )
```

- [ ] **Step 2: Reescribir `components/sales-search-filter.tsx`**

Reemplazar el `return ( … )` (a partir de línea 109 hasta el final). El bloque completo del JSX queda así:

```tsx
  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-neutral-500" />
        </div>
        <input
          type="text"
          placeholder="Buscar por boleto, cliente, email, sorteo, método o estado…"
          value={searchQuery}
          onChange={handleSearchChange}
          className="editorial-input pl-12 pr-12"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchQuery && (
        <p className="text-sm text-neutral-500">
          Se encontraron {filteredTickets.length} de {totalCount} ventas
        </p>
      )}

      <div className="editorial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#121212] border-b border-white/[0.07]">
              <tr>
                {["Boleto", "Sorteo", "Cliente", "Método", "Precio", "Estado", "Fecha", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-neutral-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {paginatedTickets.map((ticket) => {
                const statusBadgeClass =
                  ticket.payment_status === "completed"
                    ? "badge badge-success"
                    : ticket.payment_status === "pending"
                      ? "badge badge-warning"
                      : "badge badge-danger"
                const statusLabel =
                  ticket.payment_status === "completed"
                    ? "Completado"
                    : ticket.payment_status === "pending"
                      ? "Pendiente"
                      : "Fallido"
                const methodLabel =
                  ticket.payment_method === "stripe"
                    ? "Tarjeta"
                    : ticket.payment_method === "paypal"
                      ? "PayPal"
                      : ticket.payment_method === "bank_transfer"
                        ? "Transferencia"
                        : "Crypto"

                return (
                  <tr key={ticket.id} className="hover:bg-[#121212] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm text-white font-semibold">#{ticket.ticket_number}</p>
                      {ticket.ticket_hash && (
                        <p className="text-xs text-neutral-500 font-mono">{ticket.ticket_hash}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ticket.raffle?.image_url || "/placeholder.svg"}
                          alt={ticket.raffle?.title}
                          className="w-10 h-10 object-cover flex-shrink-0"
                        />
                        <span className="text-sm text-white truncate max-w-xs">{ticket.raffle?.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm">
                        <p className="text-white">{ticket.guest_name || ticket.profile?.full_name || "Usuario"}</p>
                        <p className="text-neutral-500 text-xs truncate max-w-xs">
                          {ticket.guest_email || ticket.profile?.email}
                        </p>
                        {ticket.guest_phone && (
                          <p className="text-neutral-600 text-xs">{ticket.guest_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge badge-neutral">{methodLabel}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-white">
                        ${ticket.raffle?.ticket_price?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={statusBadgeClass}>{statusLabel}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-500">
                        {formatDistanceToNow(new Date(ticket.purchased_at), { addSuffix: true, locale: es })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <DeleteTicketButton
                        ticketId={ticket.id}
                        raffleId={ticket.raffle_id}
                        ticketNumber={ticket.ticket_number}
                        paymentStatus={ticket.payment_status}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-neutral-500">
              {searchQuery ? "No se encontraron ventas con ese criterio" : "No hay ventas registradas"}
            </p>
          </div>
        )}

        {totalPages > 1 && filteredTickets.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07]">
            <p className="text-sm text-neutral-500">
              Mostrando {from + 1}-{Math.min(to, filteredTickets.length)} de {filteredTickets.length}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="editorial-button-secondary px-4 py-2 text-xs"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  const isActive = currentPage === pageNum
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        isActive
                          ? "border-b-2 border-white text-white pb-1 px-2 text-xs font-semibold tracking-widest"
                          : "border-b-2 border-transparent text-neutral-500 hover:text-white pb-1 px-2 text-xs font-semibold tracking-widest transition-colors"
                      }
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="editorial-button-secondary px-4 py-2 text-xs"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
```

(Las funciones internas `useMemo`, `handleSearchChange`, etc., no cambian — solo el JSX).

- [ ] **Step 3: Verificar visualmente**

Navegar a `/admin/sales`. Esperado:
- Header editorial con stats inline en la línea de subtítulo.
- Tabs "Todos / Completados / Pendientes" con subrayado blanco al activo (sin pill cyan).
- Tabla densa: `<thead>` con fondo `#121212`, encabezados uppercase tracking, filas con divisor hairline, hover `bg-[#121212]`.
- Método de pago: todos los métodos con `badge badge-neutral` (uniforme).
- Estado: `badge badge-success` / `badge-warning` / `badge-danger` según valor.
- Precio en blanco (no verde).
- Paginación: anterior/siguiente outline, números con subrayado al activo.

- [ ] **Step 4: Commit**

```bash
git add app/admin/sales/page.tsx components/sales-search-filter.tsx
git commit -m "feat(admin): editorial sales table and pagination"
```

---

## Tarea 13 — `/admin/settings` page wrapper

**Files:**
- Modify: `app/admin/settings/page.tsx`

- [ ] **Step 1: Eliminar imports de shadcn Card**

Eliminar la línea:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
```

(Si los iconos `Settings2` o `Globe` ya no se usan tras el cambio del Step 2, mantenerlos solo si siguen referenciados. Lucide-react importa son específicos.)

- [ ] **Step 2: Reescribir `return ( … )`**

Sustituir el bloque (líneas 32–122) por:

```tsx
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl space-y-10">
        <header data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Plataforma</p>
          <h1 className="editorial-heading">
            <span className="text-white">Configuración</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Gestiona la configuración general del sitio y los pagos</p>
        </header>

        <section className="editorial-card p-6 sm:p-8" data-aos="fade-up">
          <div className="mb-6">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Sitio</p>
            <h2 className="text-xl font-black text-white">Configuración general</h2>
            <p className="text-neutral-500 text-sm mt-1">Personaliza el nombre y logo de tu plataforma</p>
          </div>
          <SiteSettingsManager initialSettings={siteSettings} />
        </section>

        <section className="editorial-card p-6 sm:p-8" data-aos="fade-up">
          <div className="mb-6">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Métodos</p>
            <h2 className="text-xl font-black text-white">Métodos de pago disponibles</h2>
            <p className="text-neutral-500 text-sm mt-1">Activa o desactiva los métodos de pago que ofreces</p>
          </div>
          <PaymentMethodsManager initialMethods={paymentMethods} />
        </section>

        <section className="editorial-card p-6 sm:p-8" data-aos="fade-up">
          <div className="mb-6">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Cuentas</p>
            <h2 className="text-xl font-black text-white">Cuentas bancarias</h2>
            <p className="text-neutral-500 text-sm mt-1">Configura las cuentas para recibir transferencias</p>
          </div>
          <BankAccountsManager initialAccounts={bankAccounts} />
        </section>

        <section className="editorial-card p-6 sm:p-8" data-aos="fade-up">
          <div className="mb-6">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Entorno</p>
            <h2 className="text-xl font-black text-white">Variables requeridas</h2>
            <p className="text-neutral-500 text-sm mt-1">
              Asegúrate de tener configuradas las API keys necesarias en Vercel
            </p>
          </div>
          <div className="space-y-2 text-sm font-mono">
            {[
              { name: "STRIPE_SECRET_KEY", state: "ok" },
              { name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", state: "ok" },
              { name: "NEXT_PUBLIC_PAYPAL_CLIENT_ID", state: "warn" },
              { name: "NOWPAYMENTS_API_KEY", state: "warn" },
              { name: "RESEND_API_KEY", state: "ok" },
            ].map(({ name, state }) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-white/[0.07] last:border-b-0">
                <span className="text-neutral-300">{name}</span>
                <span style={{ color: state === "ok" ? "#22c55e" : "#f59e0b" }}>
                  {state === "ok" ? "✓ Configurada" : "⚠ Verificar"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
```

c) Eliminar los imports `Settings2` y `Globe` de lucide-react al tope (ya no se usan).

- [ ] **Step 3: Verificar visualmente**

Navegar a `/admin/settings`. Esperado:
- Header editorial.
- 4 secciones en `editorial-card` (sin glass, sin redondeo, sin burbujas con gradiente en headers).
- Cada sección: eyebrow + headline + descripción + el manager.
- Variables de entorno: filas con divisor hairline, indicador verde/ámbar.
- Los managers internos (banco, métodos de pago, sitio) aún se ven viejos — eso lo arreglamos en Tareas 14–16.

- [ ] **Step 4: Commit**

```bash
git add app/admin/settings/page.tsx
git commit -m "feat(admin): editorial settings page sections"
```

---

## Tarea 14 — `bank-accounts-manager.tsx`

**Files:**
- Modify: `components/bank-accounts-manager.tsx`

- [ ] **Step 1: Reemplazar imports**

Reemplazar el bloque inicial de imports:

```tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Building2, Check, X } from "lucide-react"
import { createBankAccount, updateBankAccount, deleteBankAccount } from "@/app/actions/payments"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"
```

Notas:
- Se elimina `Button`, `Card`, `Input`, `Label` (shadcn) — usamos elementos nativos con clases editoriales.
- Se elimina `toast` de "sonner" — usamos `swal` (consistente con el resto).
- Se corrige el import incorrecto `import swal from "sweetalert"` por `import { swal } from "@/lib/swal"`.

- [ ] **Step 2: Reemplazar las llamadas a `toast.*` por `swal.*`**

En `handleSubmit`:

```tsx
      if (editingId) {
        const account = accounts.find((a) => a.id === editingId)
        await updateBankAccount(editingId, {
          ...formData,
          isActive: account?.is_active || true,
        })
        swal.success("Cuenta actualizada correctamente")
      } else {
        await createBankAccount(formData)
        swal.success("Cuenta agregada correctamente")
      }
      router.refresh()
      resetForm()
    } catch (error: any) {
      swal.error("Error", error.message)
    }
```

(En `handleDelete` y `handleToggleActive` ya se usaba `swal.*` — verificar y mantener.)

- [ ] **Step 3: Reescribir el `return ( … )`**

Sustituir todo el JSX (líneas 120–297) por:

```tsx
  return (
    <div className="space-y-4">
      {accounts.length === 0 && !isAdding && (
        <div className="text-center py-10 border border-white/[0.07]">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center relative">
            <div className="absolute inset-0 blur-xl rounded-full bg-white/10" />
            <Building2 className="w-6 h-6 relative z-10 text-white" />
          </div>
          <p className="text-neutral-400 text-sm">No hay cuentas bancarias configuradas</p>
          <p className="text-neutral-500 text-xs mt-1">Agrega una cuenta para recibir transferencias</p>
        </div>
      )}

      {accounts.map((account) => (
        <div key={account.id} className="border border-white/[0.07] bg-[#0d0d0d] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {account.bank_logo ? (
                <div className="w-14 h-14 bg-white p-2 flex items-center justify-center flex-shrink-0">
                  <img
                    src={account.bank_logo || "/placeholder.svg"}
                    alt={account.bank_name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 border border-white/[0.07] bg-[#121212] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-white">{account.bank_name}</h4>
                  <button
                    onClick={() => handleToggleActive(account)}
                    className={account.is_active ? "badge badge-success" : "badge badge-danger"}
                  >
                    {account.is_active ? "Activa" : "Inactiva"}
                  </button>
                </div>
                <p className="text-sm text-neutral-300">{account.account_holder}</p>
                <p className="text-sm text-neutral-400 font-mono">{account.account_number}</p>
                <p className="text-xs text-neutral-500">{account.account_type}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => handleEdit(account)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                aria-label="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(account.id)}
                className="p-2 text-neutral-400 hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {isAdding ? (
        <div className="border border-white/[0.07] bg-[#0d0d0d] p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Nombre del banco</label>
              <input
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Ej: Banco Nacional"
                required
                className="editorial-input"
              />
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Titular de la cuenta</label>
              <input
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="Nombre completo"
                required
                className="editorial-input"
              />
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Número de cuenta</label>
              <input
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="1234567890"
                required
                className="editorial-input"
              />
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Tipo de cuenta</label>
              <input
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                placeholder="Cuenta Corriente / Cuenta de Ahorros"
                className="editorial-input"
              />
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Logo del banco (URL)</label>
              <input
                value={formData.bankLogo}
                onChange={(e) => setFormData({ ...formData, bankLogo: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="editorial-input"
              />
              <p className="text-xs text-neutral-500 mt-2">Opcional: URL del logo del banco</p>
              {formData.bankLogo && (
                <div className="mt-3 p-2 bg-white w-24 h-24 flex items-center justify-center">
                  <img src={formData.bankLogo || "/placeholder.svg"} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="editorial-button-primary flex-1">
                <Check className="w-4 h-4" />
                {editingId ? "Actualizar" : "Agregar"}
              </button>
              <button type="button" onClick={resetForm} className="editorial-button-secondary flex-1">
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full border border-dashed border-white/15 hover:border-white/40 text-neutral-400 hover:text-white transition-colors py-4 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Cuenta Bancaria
        </button>
      )}
    </div>
  )
```

- [ ] **Step 4: Verificar visualmente**

Navegar a `/admin/settings`. En la sección "Cuentas bancarias":
- Lista (si hay cuentas): cada cuenta en card hairline con badge funcional verde/rojo para Activa/Inactiva. Iconos de editar/eliminar en outline minimal.
- Botón "Agregar cuenta" con borde dashed blanco, uppercase tracking.
- Form: inputs editoriales, botones primary (blanco) y secondary (outline).

Probar agregar/editar/eliminar — la lógica funciona; solo cambian los toasts a SweetAlert.

- [ ] **Step 5: Commit**

```bash
git add components/bank-accounts-manager.tsx
git commit -m "feat(admin): editorial bank accounts manager"
```

---

## Tarea 15 — `payment-methods-manager.tsx`

**Files:**
- Modify: `components/payment-methods-manager.tsx`

- [ ] **Step 1: Eliminar el array `PAYMENT_COLORS`**

Borrar el bloque (líneas 26–31):

```tsx
const PAYMENT_COLORS = {
  stripe: "from-blue-500 to-cyan-600",
  paypal: "from-purple-500 to-pink-600",
  crypto: "from-orange-500 to-yellow-600",
  bank_transfer: "from-green-500 to-emerald-600",
}
```

Y eliminar la línea `const color = PAYMENT_COLORS[method.provider as keyof typeof PAYMENT_COLORS]` dentro del `.map`.

- [ ] **Step 2: Reescribir el `return ( … )`**

Sustituir el bloque (líneas 90–132) por:

```tsx
  return (
    <div className="grid gap-px bg-white/5 md:grid-cols-2">
      {methods.map((method) => {
        const Icon = PAYMENT_ICONS[method.provider as keyof typeof PAYMENT_ICONS]

        return (
          <div
            key={method.provider}
            className={`bg-[#0d0d0d] p-5 transition-colors ${
              method.is_enabled ? "" : "opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 border border-white/[0.07] bg-[#080808] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{method.display_name}</p>
                  <p className="text-xs text-neutral-500 truncate">{method.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {loading === method.provider && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <div className="flex flex-col items-center gap-1">
                  <Switch
                    checked={method.is_enabled}
                    onCheckedChange={() => handleToggle(method.provider, method.is_enabled)}
                    disabled={loading === method.provider}
                    className="data-[state=checked]:bg-white"
                  />
                  <span
                    className={`text-[0.65rem] font-semibold tracking-widest uppercase ${
                      method.is_enabled ? "text-[#22c55e]" : "text-neutral-500"
                    }`}
                  >
                    {method.is_enabled ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
```

c) Si `Card` (shadcn) seguía importado en este archivo, removerlo (no se usa). En el archivo actual no aparece Card; verificar y dejar solo los imports usados.

- [ ] **Step 3: Verificar visualmente**

`/admin/settings` → sección "Métodos de pago disponibles":
- Grid 2 columnas con divisores hairline.
- Cada tarjeta: icono blanco en caja `#080808` con borde hairline (sin gradiente colorido).
- Switch: estado activo en blanco (track blanco), inactivo neutral.
- Etiqueta "ACTIVO" en verde funcional, "INACTIVO" en neutral.

- [ ] **Step 4: Commit**

```bash
git add components/payment-methods-manager.tsx
git commit -m "feat(admin): editorial payment methods manager"
```

---

## Tarea 16 — `site-settings-manager.tsx`

**Files:**
- Modify: `components/site-settings-manager.tsx`

- [ ] **Step 1: Reemplazar imports**

Reemplazar el bloque inicial:

```tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { updateSiteSettings } from "@/app/actions/site-settings"
import { swal } from "@/lib/swal"
import { useRouter } from "next/navigation"
```

(Se eliminan `Button`, `Input`, `Label` shadcn y `toast` sonner — sustituidos por elementos nativos + `swal` para consistencia.)

- [ ] **Step 2: Reemplazar `toast.*` por `swal.*`**

En `handleLogoUpload`:

```tsx
      const data = await response.json()
      setLogoUrl(data.url)
      swal.success("Logo subido correctamente")
    } catch (error) {
      swal.error("Error al subir el logo")
      console.error("[v0] Logo upload error:", error)
    } finally {
      setUploading(false)
    }
```

En `handleSave`:

```tsx
      await updateSiteSettings({
        siteName,
        logoUrl: logoUrl || null,
      })
      swal.success("Configuración guardada correctamente")
      router.refresh()
    } catch (error: any) {
      swal.error("Error al guardar configuración", error.message || "")
    } finally {
      setSaving(false)
    }
```

- [ ] **Step 3: Reescribir el `return ( … )`**

Sustituir todo el JSX (líneas 73–143) por:

```tsx
  return (
    <div className="space-y-6">
      <div>
        <label className="editorial-eyebrow text-neutral-400 mb-2 block">Nombre del sitio</label>
        <input
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="MakingMoney Sorteos"
          className="editorial-input"
        />
      </div>

      <div>
        <label className="editorial-eyebrow text-neutral-400 mb-2 block">Logo del sitio</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="editorial-input flex-1"
          />
          <button
            type="button"
            onClick={() => document.getElementById("logoFile")?.click()}
            disabled={uploading}
            className="editorial-button-secondary"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir logo
              </>
            )}
          </button>
          <input id="logoFile" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </div>
        {logoUrl && (
          <div className="mt-4 p-4 border border-white/[0.07] bg-[#121212]">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Vista previa</p>
            <img src={logoUrl || "/placeholder.svg"} alt="Logo" className="h-16 object-contain" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !siteName}
        className="editorial-button-primary w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar configuración"
        )}
      </button>
    </div>
  )
```

- [ ] **Step 4: Verificar visualmente**

`/admin/settings` → sección "Configuración general":
- Inputs editoriales monocromos.
- Botón "Subir logo" outline blanco.
- Vista previa del logo: caja hairline con eyebrow "VISTA PREVIA".
- Botón guardar primario blanco.

Probar guardar — la lógica funciona; toasts ahora son SweetAlert (consistente con el resto del admin).

- [ ] **Step 5: Commit**

```bash
git add components/site-settings-manager.tsx
git commit -m "feat(admin): editorial site settings manager"
```

---

## Tarea 17 — Verificación final cross-area

**Files:** ninguno modificado en este paso.

- [ ] **Step 1: Comprobar que no quedan estilos divergentes en el alcance**

Ejecutar:

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

Esperado: salida vacía. Si aparece algún match, abrir el archivo, decidir si es residuo decorativo (eliminar/migrar) o si es color funcional admitido (ej. `text-[#22c55e]` está bien — pero el grep busca clases Tailwind con palabras de color, no hex literales, así que no debería aparecer).

- [ ] **Step 2: Tour visual manual**

Con `npm run dev`, recorrer:

1. http://localhost:3000/ — landing intacta (no debe cambiar).
2. http://localhost:3000/dashboard — header editorial + stats hairline + lista de boletos densa con badges funcionales.
3. http://localhost:3000/admin — header + 4 stats + 3 quick links + sorteos recientes con badge.
4. http://localhost:3000/admin/raffles — listado editorial, click en "EDITAR", "REALIZAR SORTEO" (probar modal monocromo), "ELIMINAR" (probar swal).
5. http://localhost:3000/admin/raffles/new — form editorial con drop-zone, crear un raffle dummy si quieres (luego eliminar).
6. http://localhost:3000/admin/raffles/<id> — header + 3 stat cards hairline + form editorial.
7. http://localhost:3000/admin/pending-payments — vacío y/o con datos; abrir modal del comprobante; probar aprobar/rechazar.
8. http://localhost:3000/admin/sales — tabs editoriales (subrayado blanco), tabla densa, búsqueda, paginación.
9. http://localhost:3000/admin/settings — 4 secciones editoriales; cada manager con sus controles editoriales; toggles, agregar/editar/eliminar cuenta bancaria, subir logo.

Cross-check: abrir landing en una pestaña y dashboard/admin en otra. Tipografía (eyebrow + headline `font-black`), bordes hairline, fondos `#080808`/`#0d0d0d`, paleta y ritmo deben sentirse del mismo sistema.

- [ ] **Step 3: Build de producción**

```bash
npm run build
```

Esperado: build exitoso. Recordar que `next.config.mjs` tiene `typescript.ignoreBuildErrors: true` — el build no detecta type errors. Si quieres validar tipos:

```bash
npx tsc --noEmit
```

(opcional, no bloqueante).

- [ ] **Step 4: Commit final si quedó algo pendiente**

Si en el tour visual surgió algún ajuste menor, commitearlo. Si todo está limpio, no hace falta commit aquí.

---

## Notas finales

- Las clases legacy `.glass-*`, `.progress-glow`, `.animate-shimmer` permanecen en `globals.css` por consumirse en rutas fuera de alcance (`/auth/*`, `/privacy`, `/terms`, `/not-found`, `crypto-checkout`). Una iteración futura puede rediseñar esas rutas y eliminar el bloque legacy.
- `--primary` / `--accent` (oro/ámbar `212 175 55`) en `:root` no se modifican: shadcn las consume en componentes default fuera del alcance.
- Si en la verificación visual aparece algún componente que sigue luciendo "viejo" y no está en la lista de tareas, abrir un seguimiento — no debería pasar, pero si pasa, se documenta y se resuelve en otra iteración.
