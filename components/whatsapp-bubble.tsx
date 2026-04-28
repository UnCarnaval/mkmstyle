"use client"

export function WhatsAppBubble() {
  const phone = "18495799551"
  const message = encodeURIComponent("Hola, tengo una pregunta sobre los sorteos de Making Money Style.")

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
      aria-label="Contactar por WhatsApp"
    >
      {/* Tooltip label */}
      <span
        className="hidden sm:block text-xs font-semibold text-white px-3 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
        style={{ backgroundColor: "#128C7E" }}
      >
        ¿Tienes dudas?
      </span>

      {/* Icon button */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: "#25D366" }}
      >
        {/* WhatsApp SVG */}
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.83.74 5.49 2.04 7.8L.5 31.5l7.9-2.07A15.46 15.46 0 0016 31.5c8.56 0 15.5-6.94 15.5-15.5S24.56.5 16 .5zm0 28.3a12.74 12.74 0 01-6.5-1.79l-.46-.28-4.69 1.23 1.25-4.57-.3-.47A12.74 12.74 0 013.2 16C3.2 9.44 8.94 4.2 16 4.2c7.06 0 12.8 5.24 12.8 11.8 0 7.06-5.74 12.8-12.8 12.8zm7.03-9.57c-.39-.2-2.28-1.12-2.63-1.25-.35-.13-.6-.2-.86.2-.25.38-.98 1.25-1.2 1.5-.22.26-.44.29-.83.1a10.5 10.5 0 01-3.08-1.9 11.55 11.55 0 01-2.13-2.65c-.22-.38-.02-.59.17-.78.17-.17.38-.44.57-.67.19-.22.25-.38.38-.63.13-.26.06-.48-.03-.67-.1-.2-.86-2.08-1.18-2.84-.31-.75-.63-.64-.86-.65h-.73c-.25 0-.67.1-1.02.48-.35.38-1.33 1.3-1.33 3.17s1.36 3.68 1.55 3.94c.2.25 2.68 4.09 6.5 5.74.91.39 1.62.62 2.17.8.91.29 1.74.25 2.4.15.73-.11 2.28-.93 2.6-1.83.32-.9.32-1.67.22-1.83-.1-.16-.35-.26-.73-.45z" />
        </svg>
      </div>
    </a>
  )
}
