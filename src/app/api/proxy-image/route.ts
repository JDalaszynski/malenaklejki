import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", {
        status: response.status,
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType =
      response.headers.get("Content-Type") || "image/png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Proxy image error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
