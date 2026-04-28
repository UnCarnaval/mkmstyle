import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-200">Sorteo no encontrado</h2>
        <p className="text-slate-400">El sorteo que buscas no existe o ya no está disponible</p>
        <Button asChild className="glass-button rounded-xl">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
