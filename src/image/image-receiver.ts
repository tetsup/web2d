import type { ImageBufferData } from '@/types/image';
import type { FrameBuffer } from '@/image/frame-buffer';
import { readImagesFromArray } from './frame-transfer';

export class ImageReceiver {
  private images: Map<number, ImageBitmap>;

  constructor(private buffer: FrameBuffer) {
    this.images = new Map();
  }

  register(imageIndex: number, imageData: ImageBitmap) {
    this.images.set(imageIndex, imageData);
  }

  private toImageObjects(imageBuffer: ImageBufferData[]) {
    return imageBuffer.map((data) => ({ pos: data.pos, image: this.images.get(data.imageIndex) }));
  }

  read() {
    const array = this.buffer.read();
    if (array == null) return;
    return this.toImageObjects(readImagesFromArray(array));
  }
}
