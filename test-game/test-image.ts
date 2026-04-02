export async function createTestImage(width: number, height: number, seed = 0): Promise<ImageBitmap> {
  const data = new Uint8ClampedArray(width * height * 4);

  function hash(x: number): number {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  }

  function value(x: number, y: number, seed: number): number {
    let h = x * 374761393 + y * 668265263 + seed * 982451653;
    h = hash(h);
    return h & 0xff;
  }

  function color(x: number, y: number) {
    const v1 = value(x, y, seed);
    const v2 = value(y, x, seed + 1);
    const v3 = value(x + y, x - y, seed + 2);

    const r = (v1 ^ (v2 << 1)) & 0xff;
    const g = (v2 ^ (v3 << 1)) & 0xff;
    const b = (v3 ^ (v1 << 1)) & 0xff;

    return [r, g, b];
  }

  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = color(x, y);

      data[i++] = r;
      data[i++] = g;
      data[i++] = b;
      data[i++] = 255;
    }
  }

  const imageData = new ImageData(data, width, height);
  return await createImageBitmap(imageData);
}
