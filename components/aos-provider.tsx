"use client"

import { useEffect } from "react"
import AOS from "aos"
import "aos/dist/aos.css"

export function AosProvider() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out" })
  }, [])

  return null
}
