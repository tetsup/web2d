import type { MessageToWorker } from '@/types/engine';
import { RenderEngine } from '@/engine/render-engine';
import { FrameBuffer } from '@/image/frame-buffer';
import { ImageReceiver } from '@/image/image-receiver';

self.onmessage = (() => {
  let renderer: RenderEngine;
  let receiver: ImageReceiver;

  return ({ data }: MessageEvent<MessageToWorker>) => {
    switch (data.command) {
      case 'init': {
        self.postMessage('init start');
        const frameBuffer = data.params.buffer != null
          ? new FrameBuffer(data.params.buffer, data.params.maxObjects)
          : null;
        receiver = new ImageReceiver(frameBuffer);
        renderer = new RenderEngine(data.params.canvas, data.params.rectSize);
        self.postMessage('init comp');
        break;
      }
      case 'render': {
        if (!renderer || !receiver) break;
        const items = receiver.readFromBuffer();
        if (items != null) renderer.render(items);
        break;
      }
      case 'renderFrame': {
        if (!renderer || !receiver) break;
        const items = receiver.resolve(data.params.frameData);
        renderer.render(items);
        break;
      }
      case 'registerImage': {
        self.postMessage(`add image index ${data.params.imageIndex}`);
        receiver.register(data.params.imageIndex, data.params.imageData);
        break;
      }
    }
  };
})();
