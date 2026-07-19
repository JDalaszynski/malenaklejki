import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blog";
import fs from "fs/promises";
import path from "path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  let imageBase64 = null;
  if (post.image) {
    try {
      const res = await fetch(`https://www.malenaklejki.pl${post.image}`);
      if (res.ok) {
        const imageBuffer = Buffer.from(await res.arrayBuffer());
        const ext = path.extname(post.image).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        imageBase64 = `data:${mime};base64,${imageBuffer.toString("base64")}`;
      }
    } catch (e) {
      console.error("Error fetching OG image background:", e);
    }
  }

  let logoBase64 = null;
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo", "malenaklejki-logo-light.png");
    const logoBuffer = await fs.readFile(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (e) {
    console.error("Error reading logo:", e);
  }

  let nunitoBuffer = null;
  try {
    const fontPath = path.join(process.cwd(), "public", "fonts", "Nunito-Bold.ttf");
    nunitoBuffer = await fs.readFile(fontPath);
  } catch (e) {
    console.error("Error reading Nunito font:", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#002c2e",
          color: "white",
          fontFamily: nunitoBuffer ? "Nunito" : "sans-serif",
          position: "relative",
        }}
      >
        {/* Tło - zdjęcie wpisu */}
        {imageBase64 && (
          <img
            src={imageBase64}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        
        {/* Gradient Overlay - primary color */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "linear-gradient(to top, rgba(16, 185, 129, 0.95) 0%, rgba(16, 185, 129, 0.6) 50%, rgba(16, 185, 129, 0) 100%)",
            display: "flex",
          }}
        />

        {/* Logo na górze - powiększone w lewym rogu */}
        {logoBase64 && (
          <img 
            src={logoBase64} 
            style={{ 
              position: "absolute",
              top: 50,
              left: 50,
              height: 80,
              objectFit: "contain"
            }} 
          />
        )}

        {/* Zawartość właściwa */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end", // Only title at bottom
            width: "100%",
            height: "100%",
            padding: "80px",
          }}
        >

          {/* Tytuł na dole */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              width: "100%"
            }}
          >
            <div
              style={{
                fontSize: 56, // Mniejszy tytuł
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: "#ffffff",
                textShadow: "0 4px 16px rgba(0,0,0,0.8)", // Mocniejszy cień dla pewności
              }}
            >
              {post.title}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: nunitoBuffer
        ? [
            {
              name: "Nunito",
              data: nunitoBuffer,
              weight: 700,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}
