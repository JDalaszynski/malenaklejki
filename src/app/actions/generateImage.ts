"use server";

import { GoogleGenAI } from "@google/genai";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { headers } from "next/headers";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_gemini_key_for_build',
});

async function callGeminiWithRetry(
  params: {
    contents: any[];
    config?: any;
  },
  maxRetries = 2
) {
  const models = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];
  let lastError: any = null;

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const currentModel = models[modelIndex];
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Calling model ${currentModel} (Attempt ${attempt + 1}/${maxRetries + 1})...`);
        return await genAI.models.generateContent({
          model: currentModel,
          ...params,
        });
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} for ${currentModel} failed:`, error.message || error);
        
        const isTransient = error.status === 503 || error.status === 429 || 
                            (error.message && (
                              error.message.includes("503") || 
                              error.message.includes("429") || 
                              error.message.includes("unavailable") || 
                              error.message.includes("overloaded")
                            ));
        
        if (isTransient && attempt < maxRetries) {
          const delay = (attempt + 1) * 1500;
          console.log(`Waiting ${delay}ms before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
  }
  throw lastError;
}

interface ImageData {
  base64: string;
  mimeType: string;
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validateImageData(imageData?: ImageData | null): string | null {
  if (!imageData) return null;
  const byteLength = Buffer.byteLength(imageData.base64, "base64");
  if (byteLength > MAX_IMAGE_BYTES) {
    return "Obraz jest zbyt duży (max 4 MB).";
  }
  if (!ALLOWED_MIMES.includes(imageData.mimeType)) {
    return "Nieobsługiwany format obrazu.";
  }
  return null;
}

async function checkGenRateLimit(): Promise<string | null> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`genai-${ip}`, 30, 3600000)) {
    return "Wykorzystano limit generacji AI. Spróbuj ponownie za godzinę.";
  }
  return null;
}

export async function generateStickerImage(
  prompt: string,
  imageData?: ImageData | null
) {
  const rateLimitError = await checkGenRateLimit();
  if (rateLimitError) return { success: false, error: rateLimitError };

  const validationError = validateImageData(imageData);
  if (validationError) return { success: false, error: validationError };

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "Brak klucza API Gemini." };
  }

  try {
    let fullPrompt: string;

    if (imageData) {
      if (prompt.trim()) {
        // Image + style hint
        fullPrompt =
          "Take the subject from this photo and convert it into a flat illustration. " +
          "Place it on a perfectly solid, pure white background (#FFFFFF). " +
          "Do NOT add any white outline borders, die-cut borders, shadows, or halos around the subject. " +
          "Preserve the exact likeness, proportions and key features of the subject. " +
          `Apply this style: ${prompt.trim()}. ` +
          "No background scenery, perfectly clean edges.";
      } else {
        // Image only — preserve subject exactly
        fullPrompt =
          "Isolate the subject of this photo and place it on a perfectly solid, pure white background (#FFFFFF). " +
          "Keep the subject EXACTLY as it appears — same colors, same proportions, same details. " +
          "Do NOT add any white outline borders, die-cut borders, shadows, or halos around the subject. " +
          "Do NOT change the style, do NOT make it cartoonish or illustrated. " +
          "Just cleanly isolate the subject on a solid pure white background.";
      }
    } else {
      // Text-only mode
      fullPrompt =
        `Create a flat vector illustration of: ${prompt}. ` +
        "Place it on a perfectly solid, pure white background (#FFFFFF). " +
        "Do NOT add any white outline borders, die-cut borders, shadows, or halos around the subject. " +
        "Style: bold clean outlines, no shadows, no background scenery, " +
        "vibrant colors, kawaii/fun aesthetic.";
    }

    const parts: object[] = [];

    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.base64,
        },
      });
    }

    parts.push({ text: fullPrompt });

    const response = await callGeminiWithRetry({
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Find the image part in the response
    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = responseParts.find((p: any) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      return {
        success: false,
        error: "Generator nie stworzył obrazu. Spróbuj innego opisu.",
      };
    }

    // Convert base64 → Buffer → Blob and upload to Firebase Storage
    const base64 = imagePart.inlineData.data as string;
    const mimeType = (imagePart.inlineData.mimeType as string) || "image/png";
    const buffer = Buffer.from(base64, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    const ext = mimeType.split("/")[1] || "png";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    const snapshot = await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(snapshot.ref);

    return { success: true, url };
  } catch (error: any) {
    console.error("Generation Error:", error);
    return {
      success: false,
      error: error.message || "Błąd podczas generowania naklejki.",
    };
  }
}

export async function removeStickerBackground(
  imageData: ImageData
) {
  const rateLimitError = await checkGenRateLimit();
  if (rateLimitError) return { success: false, error: rateLimitError };

  const validationError = validateImageData(imageData);
  if (validationError) return { success: false, error: validationError };

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "Brak klucza API." };
  }

  try {
    const prompt =
      "Remove the background from this image. Keep the main subject exactly as it is, with its original colors, lighting, texture, and details. Make the entire background completely white (#FFFFFF). Do not add any shadows, vignettes, outline borders, or additional elements. Just the isolated subject on a solid pure white background.";

    const parts: object[] = [
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.base64,
        },
      },
      { text: prompt },
    ];

    const response = await callGeminiWithRetry({
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = responseParts.find((p: any) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      return {
        success: false,
        error: "Nie jesteśmy w stanie usunąć tła. Spróbuj innego zdjęcia.",
      };
    }

    const base64 = imagePart.inlineData.data as string;
    const mimeType = (imagePart.inlineData.mimeType as string) || "image/png";
    const buffer = Buffer.from(base64, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    const ext = mimeType.split("/")[1] || "png";
    const fileName = `bg-removed-${crypto.randomUUID()}.${ext}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    const snapshot = await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(snapshot.ref);

    return { success: true, url };
  } catch (error: any) {
    console.error("Background Removal Error:", error);
    return {
      success: false,
      error: error.message || "Błąd podczas usuwania tła naklejki.",
    };
  }
}

export async function enhanceStickerQuality(
  imageData: ImageData
) {
  const rateLimitError = await checkGenRateLimit();
  if (rateLimitError) return { success: false, error: rateLimitError };

  const validationError = validateImageData(imageData);
  if (validationError) return { success: false, error: validationError };

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "Brak klucza API Gemini." };
  }

  try {
    const prompt =
      "TECHNICAL IMAGE CLEANUP ONLY. Output must be pixel-level identical to the input in style, colors, composition and artistic intent. STRICTLY FORBIDDEN: changing the art style (e.g. converting flat 2D illustration to 3D render), adding new lighting or shadows, changing colors or color palette, altering composition or proportions, adding or removing any elements, making the image look photorealistic or rendered. ALLOWED ONLY: remove JPEG compression artifacts and pixelation, reduce digital noise and grain, sharpen edges and fine details that are already present in the original, improve clarity of existing lines. The result must look exactly like the original image — same style (flat, illustrated, photographic, or otherwise), same colors, same mood — just technically cleaner and sharper. Think of it as a lossless quality improvement, not a creative transformation.";

    const parts: object[] = [
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.base64,
        },
      },
      { text: prompt },
    ];

    const response = await callGeminiWithRetry({
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = responseParts.find((p: any) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      return {
        success: false,
        error: "Nie jesteśmy w stanie poprawić jakości obrazu.",
      };
    }

    const base64 = imagePart.inlineData.data as string;
    const mimeType = (imagePart.inlineData.mimeType as string) || "image/png";
    const buffer = Buffer.from(base64, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    const ext = mimeType.split("/")[1] || "png";
    const fileName = `enhanced-${crypto.randomUUID()}.${ext}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    const snapshot = await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(snapshot.ref);

    return { success: true, url };
  } catch (error: any) {
    console.error("Enhancement Error:", error);
    return {
      success: false,
      error: error.message || "Błąd podczas poprawiania jakości naklejki.",
    };
  }
}

