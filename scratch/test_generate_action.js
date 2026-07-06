const Module = require('module');
const originalRequire = Module.prototype.require;

// Mock next/headers
Module.prototype.require = function(path) {
  if (path === 'next/headers') {
    return {
      headers: async () => {
        return {
          get: (name) => {
            if (name === 'x-forwarded-for') return '127.0.0.1';
            return null;
          }
        };
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

require('dotenv').config({ path: '.env.local' });

const { generateStickerImage } = require("../src/app/actions/generateImage");

async function run() {
  console.log("Calling generateStickerImage...");
  try {
    const result = await generateStickerImage("a happy yellow duck");
    console.log("Result received:", result);
  } catch (error) {
    console.error("Uncaught error:", error);
  }
}

run();
