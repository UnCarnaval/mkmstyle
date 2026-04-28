import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("site/")) {
          throw new Error("Ruta inválida para assets del sitio")
        }
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
          maximumSizeInBytes: 10 * 1024 * 1024,
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[v0] [upload-site-asset] Blob uploaded:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error("[v0] [upload-site-asset] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Error al subir la imagen" },
      { status: 400 },
    )
  }
}
