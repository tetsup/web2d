import type { GameRenderer } from '@/types/engine';
import type { ImageBufferData, ImageObject, ImageWithId } from '@/types/image';
import type { FrameBuffer } from '@/image/frame-buffer';
import type { WorkerWrapper } from '@/engine/worker-wrapper';
import { BiMap } from '@/utils/map';
import { createArrayFromImages } from './frame-transfer';

export class ImageSender implements GameRenderer {
  private idMapper: BiMap<number, string>;
  private nextIndex: number = 0;
  constructor(
    private buffer: FrameBuffer,
    private worker: WorkerWrapper
  ) {
    this.idMapper = new BiMap();
  }

  private objectToBufferData(imageObject: ImageObject): ImageBufferData {
    return { pos: imageObject.pos, imageIndex: this.getIndex(imageObject.imageId) };
  }

  private issueIndex() {
    this.nextIndex += 1;
    return this.nextIndex - 1;
  }

  private getIndex(imageId: string) {
    const imageIndex = this.idMapper.getByValue(imageId);
    if (imageIndex != null) return imageIndex;
    return 0xffffffff;
  }

  private getIndexWithRegister(image: ImageWithId) {
    const imageIndex = this.idMapper.getByValue(image.imageId);
    if (imageIndex != null) return imageIndex;
    const newIndex = this.issueIndex();
    this.idMapper.set(newIndex, image.imageId);
    return newIndex;
  }

  registerImage(image: ImageWithId) {
    const imageIndex = this.getIndexWithRegister(image);
    this.worker.post({
      command: 'registerImage',
      params: { imageIndex: imageIndex, imageData: image.imageData },
    });
  }

  render(imageObjects: ImageObject[]) {
    const array = createArrayFromImages(imageObjects.map((imageObject) => this.objectToBufferData(imageObject)));
    this.buffer.write(array);
  }
}
