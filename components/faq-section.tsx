"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

const FAQS = [
  {
    q: "¿Cómo funciona un sorteo?",
    a: "Compras uno o más boletos para el sorteo que te interesa. Cuando todos los boletos estén vendidos, realizamos el sorteo de forma aleatoria y el ganador recibe el premio.",
  },
  {
    q: "¿Cómo sé que el sorteo es justo?",
    a: "Todos nuestros sorteos son verificables y transparentes. El proceso de selección es completamente aleatorio. Puedes verificar tu boleto en cualquier momento desde la sección 'Verificar Boletos'.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjetas de crédito/débito (Stripe), PayPal, criptomonedas y transferencias bancarias. Todos los pagos están encriptados y son seguros.",
  },
  {
    q: "¿Cómo recibo mi premio si gano?",
    a: "Te contactamos directamente al email con el que te registraste para coordinar la entrega. Los premios se entregan en tiempo récord, generalmente en menos de 72 horas tras el sorteo.",
  },
  {
    q: "¿Puedo participar sin crear cuenta?",
    a: "Sí, puedes participar como invitado proporcionando tu email y datos de contacto. Sin embargo, crear una cuenta te permite llevar un historial de todos tus boletos.",
  },
 
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 border-t border-white/5">
      <div className="container mx-auto max-w-3xl">

        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-3" style={{ color: "#ffffff" }}>
            Preguntas frecuentes
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            ¿Tienes <span style={{ color: "#ffffff" }}>dudas?</span>
          </h2>
        </div>

        <div className="space-y-px">
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderColor: "rgba(255,255,255,0.06)" }} className="border-b">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              >
                <span
                  className="font-semibold text-sm sm:text-base text-white/90 group-hover:text-white transition-colors"
                >
                  {faq.q}
                </span>
                <span
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full border transition-colors"
                  style={{
                    borderColor: open === i ? "#ffffff" : "rgba(255,255,255,0.15)",
                    color: open === i ? "#ffffff" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {open === i ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open === i ? 300 : 0 }}
              >
                <p className="text-neutral-400 text-sm leading-relaxed pb-5">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}
