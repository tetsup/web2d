import type { RenderItem, RectSize } from '@/types/image';

export class RenderEngine {
  private ctx: OffscreenCanvasRenderingContext2D;
  private ofs: OffscreenCanvas;
  private ofsCtx: OffscreenCanvasRenderingContext2D;

  constructor(canvas: OffscreenCanvas, private rectSize: RectSize) {
    this.ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    })!;
    if (!this.ctx) throw new Error('Canvas 2D context not available');
    this.ofs = new OffscreenCanvas(rectSize.width, rectSize.height);
    this.ofsCtx = this.ofs.getContext('2d')!;
  }

  render(items: RenderItem[]) {
    this.ofsCtx.fillStyle = 'white';
    this.ofsCtx.fillRect(0, 0, this.rectSize.width, this.rectSize.height);
    items.forEach((item) => {
      if (item.image) this.ofsCtx.drawImage(item.image, item.pos.x, item.pos.y);
    });
    this.ctx.drawImage(this.ofs, 0, 0);
  }
}
