import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN_PRIVATE,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("transfers/")) {
          throw new Error("Ruta inválida para comprobantes")
        }
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
          maximumSizeInBytes: 10 * 1024 * 1024,
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[upload] Private blob uploaded:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error("[upload] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Error al subir el comprobante" },
      { status: 400 },
    )
  }
}
