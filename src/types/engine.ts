import type { ImageBufferData, ImageObject, ImageWithId, RectSize } from './image';
import type { InputManagerLike, Key, KeyAssignment, SoftPadLike } from './input';

export interface GameRenderer {
  registerImage: (image: ImageWithId) => void;
  render: (imageObjects: ImageObject[]) => void;
}

export type OnInitGame = (renderer: GameRenderer) => PromiseLike<boolean>;

export type OnTickGame<InputKeys extends Key> = (
  input: InputManagerLike<InputKeys>,
  clock: number,
  renderer: GameRenderer
) => PromiseLike<boolean>;

export type GameOptions<InputKeys extends Key> = {
  maxObjects: number;
  rectSize: RectSize;
  keyAssignment: KeyAssignment<InputKeys>;
  assignPad?: (input: InputManagerLike<InputKeys>) => SoftPadLike<InputKeys>;
};

export interface Game<InputKeys extends Key> {
  onTick: OnTickGame<InputKeys>;
  onInit: OnInitGame;
}

/** Transport mode for render frame data */
export type TransparentMode = 'sab' | 'message';

export type MessageToWorker =
  | {
      command: 'init';
      params: {
        canvas: OffscreenCanvas;
        buffer: SharedArrayBuffer;
        maxObjects: number;
        rectSize: RectSize;
      };
    }
  | {
      command: 'render';
    }
  | {
      command: 'renderFrame';
      params: {
        /** Serialized frame data in message mode */
        frameData: ImageBufferData[];
      };
    }
  | {
      command: 'registerImage';
      params: {
        imageIndex: number;
        imageData: ImageBitmap;
      };
    };

export type Phase = 'off' | 'loading' | 'ready' | 'running' | 'pause' | 'error';

export type ClockState =
  | {
      phase: 'off' | 'loading' | 'error';
      speed: number;
    }
  | {
      phase: 'pause' | 'ready';
      time: number;
      speed: number;
    }
  | {
      phase: 'running';
      time: number;
      speed: number;
      lastTick: number;
    };
