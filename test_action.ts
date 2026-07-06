import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock next/headers
jest = require('jest-mock');
jest.mock('next/headers', () => ({
  headers: () => new Map([['x-forwarded-for', '127.0.0.1']]),
}));

import { generateStickerImage } from "./src/app/actions/generateImage";

async function test() {
  try {
    console.log("Calling generateStickerImage...");
    const result = await generateStickerImage("a cat");
    console.log("Result:", result);
  } catch (e) {
    console.error("Uncaught Error:", e);
  }
}
test();
