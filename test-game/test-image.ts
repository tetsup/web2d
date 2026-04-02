export async function createTestImage(width: number, height: number, seed = 0): Promise<ImageBitmap> {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;

    data[i] = (pixelIndex + seed) % 256;
    data[i + 1] = ((pixelIndex >> 2) + seed * 3) % 256;
    data[i + 2] = (128 + seed * 7) % 256;
    data[i + 3] = 255;
  }

  const imageData = new ImageData(data, width, height);
  return await createImageBitmap(imageData);
}
