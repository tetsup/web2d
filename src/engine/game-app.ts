import type { Game, GameOptions, TransparentMode } from '@/types/engine';
import type { Key } from '@/types/input';
import { InputManager } from '@/input/input-manager';
import { KeyboardListener } from '@/input/keyboard-listener';
import { FrameBuffer } from '@/image/frame-buffer';
import { ImageSender } from '@/image/image-sender';
import { GameEngine } from './game-engine';
import { WorkerWrapper } from './worker-wrapper';
import { resolveTransparentMode } from '@/utils/transparent-mode';

export class GameApp<InputKeys extends Key> {
  private worker: WorkerWrapper;
  private sharedBuffer: SharedArrayBuffer;
  private gameEngine: GameEngine<InputKeys>;
  private keyboard: KeyboardListener<InputKeys>;
  private imageSender: ImageSender;

  constructor(
    private canvas: HTMLCanvasElement,
    game: Game<InputKeys>,
    gameOptions: GameOptions<InputKeys>
  ) {
    this.worker = new WorkerWrapper();
    this.sharedBuffer = new SharedArrayBuffer(FrameBuffer.requiredSize(gameOptions.maxObjects));
    const frameBuffer = new FrameBuffer(this.sharedBuffer, gameOptions.maxObjects);
    const inputManager = new InputManager<InputKeys>();
    this.keyboard = new KeyboardListener(inputManager, gameOptions.keyAssignment);
    gameOptions.assignPad?.(inputManager);
    this.imageSender = new ImageSender(frameBuffer, this.worker);
    this.gameEngine = new GameEngine(this.imageSender, inputManager, game);

    const offscreen = this.canvas.transferControlToOffscreen();

    this.worker.post({
      command: 'init',
      params: {
        canvas: offscreen,
        buffer: this.sharedBuffer,
        maxObjects: gameOptions.maxObjects,
        rectSize: gameOptions.rectSize,
      },
    });

    const initialMode = resolveTransparentMode();
    this.applyMode(initialMode);
  }

  setTransparentMode(mode: TransparentMode) {
    this.applyMode(mode);
  }

  private applyMode(mode: TransparentMode) {
    this.imageSender.setMode(mode);
  }

  start() {
    this.gameEngine.start();
    this.keyboard.start();
  }

  pause() {
    this.keyboard.stop();
    this.gameEngine.pause();
  }

  advance(delta: number) {
    this.gameEngine.advance(delta);
  }

  destroy() {
    this.pause();
    this.gameEngine.pause();
    this.worker.terminate();
  }
}
