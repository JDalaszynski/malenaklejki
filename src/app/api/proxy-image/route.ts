import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { headers } from "next/headers";

const ALLOWED_HOSTS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "lh3.googleusercontent.com",
];

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  
  // Rate limiting (max 100 requests per minute)
  if (!checkRateLimit(`proxy-image-${ip}`, 100, 60000)) {
    console.warn(`[proxy-image] Rate limit exceeded for IP: ${ip}`);
    return new NextResponse("Zbyt wiele zapytań", { status: 429 });
  }

  const urlParam = request.nextUrl.searchParams.get("url");
  console.log(`[proxy-image] Received request for URL: ${urlParam}`);

  if (!urlParam) {
    console.warn(`[proxy-image] Missing url parameter`);
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlParam);
  } catch {
    console.warn(`[proxy-image] Invalid URL: ${urlParam}`);
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (parsedUrl.protocol !== "https:") {
    console.warn(`[proxy-image] Only HTTPS allowed: ${urlParam}`);
    return new NextResponse("Only HTTPS allowed", { status: 400 });
  }

  const isAllowedHost = ALLOWED_HOSTS.some(
    (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
  );

  if (!isAllowedHost) {
    console.warn(`[proxy-image] Domain not allowed: ${parsedUrl.hostname}`);
    return new NextResponse("Domain not allowed", { status: 403 });
  }

  try {
    const response = await fetch(parsedUrl.toString());

    if (!response.ok) {
      console.warn(`[proxy-image] Failed to fetch image: status=${response.status} URL=${urlParam}`);
      return new NextResponse("Failed to fetch image", {
        status: response.status,
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type") || "image/png";

    console.log(`[proxy-image] Successfully proxied image. Content-Type: ${contentType}. Size: ${buffer.byteLength} bytes.`);

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
