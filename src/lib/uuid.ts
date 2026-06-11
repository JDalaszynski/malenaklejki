import { v4 as uuidv4 } from "uuid";

export function getUUID(): string {
  // Try using crypto.randomUUID if available, otherwise fallback to uuid package
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return uuidv4();
}
