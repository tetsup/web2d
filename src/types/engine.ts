import type { ImageObject, ImageWithId, RectSize } from './image';
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

export type TransparentMode = 'auto' | 'sab' | 'message';
export type ResolvedTransparentMode = 'sab' | 'message';

export type GameOptions<InputKeys extends Key> = {
  maxObjects: number;
  rectSize: RectSize;
  keyAssignment: KeyAssignment<InputKeys>;
  assignPad?: (input: InputManagerLike<InputKeys>) => SoftPadLike<InputKeys>;
  transparent?: TransparentMode;
};

export interface Game<InputKeys extends Key> {
  onTick: OnTickGame<InputKeys>;
  onInit: OnInitGame;
}

export type MessageToWorker =
  | {
      command: 'init';
      params: {
        canvas: OffscreenCanvas;
        buffer: SharedArrayBuffer;
        maxObjects: number;
        rectSize: RectSize;
        transparent: ResolvedTransparentMode;
      };
    }
  | {
      command: 'render';
    }
  | {
      command: 'registerImage';
      params: {
        imageIndex: number;
        imageData: ImageBitmap;
      };
    }
  | {
      command: 'setTransparentMode';
      params: {
        mode: ResolvedTransparentMode;
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
