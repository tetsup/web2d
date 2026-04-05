import type { ResolvedTransparentMode } from '@/types/engine';
import type { RectSize } from '@/types/image';
import type { ImageReceiver } from '@/image/image-receiver';

export class RenderEngine {
  private ctx: OffscreenCanvasRenderingContext2D;
  private ofs: OffscreenCanvas;
  private ofsCtx: OffscreenCanvasRenderingContext2D;
  private transparent: boolean;

  constructor(
    canvas: OffscreenCanvas,
    private receiver: ImageReceiver,
    private rectSize: RectSize,
    mode: ResolvedTransparentMode = 'sab'
  ) {
    this.transparent = mode === 'message';
    this.ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    })!;
    if (!this.ctx) throw new Error('Canvas 2D context not available');
    this.ofs = new OffscreenCanvas(rectSize.width, rectSize.height);
    this.ofsCtx = this.ofs.getContext('2d')!;
  }

  setTransparentMode(mode: ResolvedTransparentMode): void {
    this.transparent = mode === 'message';
  }

  render() {
    if (this.transparent) {
      this.ofsCtx.clearRect(0, 0, this.rectSize.width, this.rectSize.height);
    } else {
      this.ofsCtx.fillStyle = 'white';
      this.ofsCtx.fillRect(0, 0, this.rectSize.width, this.rectSize.height);
    }
    this.receiver.read()?.forEach((object) => {
      if (object.image) this.ofsCtx.drawImage(object.image, object.pos.x, object.pos.y);
    });
    this.ctx.drawImage(this.ofs, 0, 0);
  }
}
