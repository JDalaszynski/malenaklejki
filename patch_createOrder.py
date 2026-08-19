import re

with open("src/app/actions/createOrder.ts", "r") as f:
    content = f.read()

# Rename the original export async function createOrder(rawData: any) { to async function doCreateOrder(rawData: any) {
content = content.replace("export async function createOrder(rawData: any) {", "async function doCreateOrder(rawData: any) {")

# Append the new wrapper at the end of the file
wrapper = """
export async function createOrder(rawData: any) {
  try {
    const result = await doCreateOrder(rawData);
    // Zwracamy string, aby uniknąć błędów serializacji "An error occurred in the Server Components render" Next.js
    return JSON.stringify(result);
  } catch (error: any) {
    console.error("createOrder wrapper error:", error);
    return JSON.stringify({ success: false, error: String(error?.message || error) });
  }
}
"""
content += wrapper

with open("src/app/actions/createOrder.ts", "w") as f:
    f.write(content)
