async function fileToBase64(buffer: Buffer): Promise<string> {
  return buffer.toString("base64");
}