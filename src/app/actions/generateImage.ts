"use server";

import { GoogleGenAI } from "@google/genai";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_gemini_key_for_build',
});

interface ImageData {
  base64: string;
  mimeType: string;
}

export async function generateStickerImage(
  prompt: string,
  imageData?: ImageData | null
) {
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

    const response = await genAI.models.generateContent({
      model: "gemini-3.1-flash-image",
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
        error: "Gemini nie zwrócił obrazu. Spróbuj innego opisu!",
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
    console.error("Gemini Generation Error:", error);
    return {
      success: false,
      error: error.message || "Błąd podczas generowania naklejki.",
    };
  }
}

export async function removeStickerBackground(
  imageData: ImageData
) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "Brak klucza API Gemini." };
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

    const response = await genAI.models.generateContent({
      model: "gemini-3.1-flash-image",
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
        error: "Gemini nie był w stanie usunąć tła. Spróbuj innego zdjęcia!",
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
    console.error("Gemini Background Removal Error:", error);
    return {
      success: false,
      error: error.message || "Błąd podczas usuwania tła naklejki.",
    };
  }
}

export async function enhanceStickerQuality(
  imageData: ImageData
) {
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

    const response = await genAI.models.generateContent({
      model: "gemini-3.1-flash-image",
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
        error: "Gemini nie był w stanie poprawić jakości obrazu.",
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
    console.error("Gemini Enhancement Error:", error);
    return {
      success: false,
      error: error.message || "Błąd podczas poprawiania jakości naklejki.",
    };
  }
}

