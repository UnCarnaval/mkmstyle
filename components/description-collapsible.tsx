"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const CHAR_LIMIT = 220

export function DescriptionCollapsible({ description }: { description: string }) {
  const isLong = description.length > CHAR_LIMIT
  const [open, setOpen] = useState(!isLong)

  return (
    <div className="border-t border-white/5 pt-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-xs tracking-widest uppercase font-semibold text-white/70 group-hover:text-white transition-colors">
          Descripción
        </span>
        {isLong && (
          open
            ? <ChevronUp className="w-4 h-4 text-neutral-600" />
            : <ChevronDown className="w-4 h-4 text-neutral-600" />
        )}
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 600 : 0 }}
      >
        <p className="text-neutral-400 text-sm leading-relaxed mt-3">{description}</p>
      </div>
    </div>
  )
}
