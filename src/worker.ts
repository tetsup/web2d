import type { MessageToWorker, ResolvedTransparentMode } from '@/types/engine';
import { RenderEngine } from '@/engine/render-engine';
import { FrameBuffer } from '@/image/frame-buffer';
import { ImageReceiver } from '@/image/image-receiver';

self.onmessage = (() => {
  let renderer: RenderEngine;
  let receiver: ImageReceiver;
  let currentTransparentMode: ResolvedTransparentMode = 'sab';

  return ({ data }: MessageEvent<MessageToWorker>) => {
    switch (data.command) {
      case 'init':
        self.postMessage('init start');
        currentTransparentMode = data.params.transparent;
        const frameBuffer = new FrameBuffer(data.params.buffer, data.params.maxObjects);
        receiver = new ImageReceiver(frameBuffer);
        renderer = new RenderEngine(data.params.canvas, receiver, data.params.rectSize, currentTransparentMode);
        self.postMessage('init comp');
        break;
      case 'render':
        renderer?.render();
        break;
      case 'registerImage':
        self.postMessage(`add image index ${data.params.imageIndex}`);
        receiver.register(data.params.imageIndex, data.params.imageData);
        break;
      case 'setTransparentMode':
        currentTransparentMode = data.params.mode;
        renderer?.setTransparentMode(currentTransparentMode);
        break;
    }
  };
})();
