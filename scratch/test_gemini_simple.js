const { GoogleGenAI } = require("@google/genai");
require('dotenv').config({ path: '.env.local' });

console.log("API Key present:", !!process.env.GEMINI_API_KEY);
console.log("API Key value (first 8 chars):", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) : "none");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  console.log("Initializing Gemini request...");
  try {
    console.log("Calling generateImages...");
    const response = await genAI.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: "a happy yellow duck sticker, clean vector, white background",
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
      }
    });
    console.log("Response received!");
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error during call:", error);
  }
}

run();
