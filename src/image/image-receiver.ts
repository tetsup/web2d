import type { ImageBufferData, RenderItem } from '@/types/image';
import type { FrameBuffer } from '@/image/frame-buffer';
import { readImagesFromArray } from './frame-transfer';

export class ImageReceiver {
  private images: Map<number, ImageBitmap>;

  constructor(private buffer: FrameBuffer | null) {
    this.images = new Map();
  }

  register(imageIndex: number, imageData: ImageBitmap) {
    this.images.set(imageIndex, imageData);
  }

  private toRenderItems(imageBuffer: ImageBufferData[]): RenderItem[] {
    return imageBuffer.map((data) => ({ pos: data.pos, image: this.images.get(data.imageIndex) }));
  }

  /** Read from SharedArrayBuffer and convert to RenderItems (SAB mode). */
  readFromBuffer(): RenderItem[] | null {
    if (this.buffer == null) return null;
    const array = this.buffer.read();
    if (array == null) return null;
    return this.toRenderItems(readImagesFromArray(array));
  }

  /** Convert a message-mode frame payload to RenderItems. */
  resolve(frameData: ImageBufferData[]): RenderItem[] {
    return this.toRenderItems(frameData);
  }
}
