import type { RectSize } from '@/types/image';
import type { ImageReceiver } from '@/image/image-receiver';

export class RenderEngine {
  private ctx: OffscreenCanvasRenderingContext2D;
  private ofs: OffscreenCanvas;
  private ofsCtx: OffscreenCanvasRenderingContext2D;

  constructor(
    canvas: OffscreenCanvas,
    private receiver: ImageReceiver,
    private rectSize: RectSize
  ) {
    this.ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    })!;
    if (!this.ctx) throw new Error('Canvas 2D context not available');
    this.ofs = new OffscreenCanvas(rectSize.width, rectSize.height);
    this.ofsCtx = this.ofs.getContext('2d')!;
  }

  render() {
    this.ofsCtx.fillStyle = 'white';
    this.ofsCtx.fillRect(0, 0, this.rectSize.width, this.rectSize.height);
    this.receiver.read()?.forEach((object) => {
      if (object.image) this.ofsCtx.drawImage(object.image, object.pos.x, object.pos.y);
    });
    this.ctx.drawImage(this.ofs, 0, 0);
  }
}
