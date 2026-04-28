import { NextResponse } from "next/server"
import { get } from "@vercel/blob"
import { createServerClient } from "@/lib/supabase/server"

const PRIVATE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN_PRIVATE

function isPrivateBlobUrl(url: string) {
  // Comprobantes are stored under transfers/ in the private blob store
  return /\/transfers\//.test(url)
}

async function isAdmin() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    return profile?.role === "admin"
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return new NextResponse("Missing URL parameter", { status: 400 })
    }

    if (isPrivateBlobUrl(url)) {
      if (!(await isAdmin())) {
        return new NextResponse("Forbidden", { status: 403 })
      }

      if (!PRIVATE_TOKEN) {
        console.error("[image-proxy] BLOB_READ_WRITE_TOKEN_PRIVATE is not set")
        return new NextResponse("Server misconfigured", { status: 500 })
      }

      try {
        const result = await get(url, { access: "private", token: PRIVATE_TOKEN })
        if (!result || result.statusCode !== 200 || !result.stream) {
          console.error("[image-proxy] get() returned no body for", url)
          return new NextResponse("Blob not found", { status: 404 })
        }
        const reader = result.stream.getReader()
        const chunks: Uint8Array[] = []
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) chunks.push(value)
        }
        const total = chunks.reduce((n, c) => n + c.byteLength, 0)
        const buffer = new Uint8Array(total)
        let offset = 0
        for (const c of chunks) {
          buffer.set(c, offset)
          offset += c.byteLength
        }
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": result.blob.contentType || "image/png",
            "Cache-Control": "private, max-age=300",
          },
        })
      } catch (e: any) {
        console.error("[image-proxy] get() failed:", e?.message ?? e)
        return new NextResponse("Unable to fetch private blob", { status: 502 })
      }
    }

    const response = await fetch(url)
    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status })
    }
    const contentType = response.headers.get("content-type") || "image/png"
    const imageBuffer = await response.arrayBuffer()
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    })
  } catch (error) {
    console.error("[v0] Image proxy error:", error)
    return new NextResponse("Error fetching image", { status: 500 })
  }
}
