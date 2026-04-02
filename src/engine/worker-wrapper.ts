import type { MessageToWorker } from '@/types/engine';

export class WorkerWrapper {
  private worker: Worker;
  constructor() {
    this.worker = new Worker(new URL('../worker.ts', import.meta.url), {
      type: 'module',
    });
    this.worker.onmessage = (e) => {
      console.log('[worker]', e.data);
    };
    this.worker.onerror = (e) => {
      console.error('[worker error]', e.error);
    };
  }

  post(message: MessageToWorker) {
    const transfer =
      message.command === 'init'
        ? [message.params.canvas]
        : message.command === 'registerImage'
          ? [message.params.imageData]
          : [];
    this.worker.postMessage(message, transfer);
  }

  terminate() {
    this.worker.terminate();
  }
}
