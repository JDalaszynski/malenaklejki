import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const response = await genAI.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: "Create a flat vector illustration of: a cat. Place it on a perfectly solid, pure white background (#FFFFFF). Do NOT add any white outline borders, die-cut borders, shadows, or halos around the subject. Style: bold clean outlines, no shadows, no background scenery, vibrant colors, kawaii/fun aesthetic.",
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        outputMimeType: "image/png"
      }
    });
    
    console.log("Response:", JSON.stringify(response, null, 2));
    
    const generatedImage = response.generatedImages?.[0];
    if (!generatedImage || !generatedImage.image?.imageBytes) {
       console.log("No image returned");
    } else {
       console.log("Success! Image size:", generatedImage.image.imageBytes.length);
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
