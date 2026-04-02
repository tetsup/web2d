import { vi } from 'vitest';

interface MockImageData {
  width: number;
  height: number;
  data: any;
}

interface MockImageBitmap {
  width: number;
  height: number;
  data: any;
}

export class MockImageSender {
  render = vi.fn((img: MockImageData) => img);
  registerImage = vi.fn((objectId: string, imageData: MockImageBitmap) => {});
}

export class MockWorker {
  post = vi.fn((message: any) => {});
  terminate = vi.fn(() => {});
}
