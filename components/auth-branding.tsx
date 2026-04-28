import Link from "next/link"

export function AuthBranding({ siteName }: { siteName: string }) {
  return (
    <Link href="/" className="block text-center mb-10 group">
      <img
        src="/logo.png"
        alt={siteName}
        className="h-12 w-auto object-contain mx-auto mb-4"
      />
      <p className="editorial-eyebrow text-neutral-500 group-hover:text-neutral-300 transition-colors">
        Acceso
      </p>
    </Link>
  )
}
