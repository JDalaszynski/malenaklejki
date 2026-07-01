import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Extract base64 content
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Compress the PNG using sharp
    const compressedBuffer = await sharp(buffer)
      .png({
        palette: true,        // Quantize colors (8-bit palette), massive size reduction
        quality: 85,          // High quality quantization
        compressionLevel: 9,  // Maximum zlib compression
      })
      .toBuffer();

    return new Response(new Uint8Array(compressedBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(compressedBuffer.length),
      },
    });
  } catch (error: any) {
    console.error("Compression error in /api/compress-png:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
