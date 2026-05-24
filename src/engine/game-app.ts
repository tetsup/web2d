import type { Game, GameOptions, TransparentMode } from '@/types/engine';
import type { Key } from '@/types/input';
import { resolveTransparentMode } from '@/utils/transparent-mode';
import { InputManager } from '@/input/input-manager';
import { KeyboardListener } from '@/input/keyboard-listener';
import { FrameBuffer } from '@/image/frame-buffer';
import { ImageSender } from '@/image/image-sender';
import { WorkerWrapper } from '../worker-wrapper';
import { GameEngine } from './game-engine';
import { StatManager } from './stat';

export class GameApp<InputKeys extends Key> {
  private worker: WorkerWrapper;
  private gameEngine: GameEngine<InputKeys>;
  private keyboard: KeyboardListener<InputKeys>;
  private imageSender: ImageSender;
  readonly stat: StatManager;

  constructor(
    private canvas: HTMLCanvasElement,
    game: Game<InputKeys>,
    gameOptions: GameOptions<InputKeys>
  ) {
    // Resolve transport mode before attempting to create a SharedArrayBuffer,
    // because SharedArrayBuffer throws in non-cross-origin-isolated environments.
    const initialMode = resolveTransparentMode();

    this.worker = new WorkerWrapper();

    let frameBuffer: FrameBuffer | null = null;
    let sharedBuffer: SharedArrayBuffer | undefined;
    if (initialMode === 'sab') {
      sharedBuffer = new SharedArrayBuffer(FrameBuffer.requiredSize(gameOptions.maxObjects));
      frameBuffer = new FrameBuffer(sharedBuffer, gameOptions.maxObjects);
    }

    const inputManager = new InputManager<InputKeys>();
    this.keyboard = new KeyboardListener(inputManager, gameOptions.keyAssignment);
    gameOptions.assignPad?.(inputManager);
    this.imageSender = new ImageSender(frameBuffer, this.worker);
    this.stat = new StatManager();
    this.gameEngine = new GameEngine(this.imageSender, inputManager, game, this.stat);

    const offscreen = this.canvas.transferControlToOffscreen();

    this.worker.post({
      command: 'init',
      params: {
        canvas: offscreen,
        buffer: sharedBuffer,
        maxObjects: gameOptions.maxObjects,
        rectSize: gameOptions.rectSize,
      },
    });

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

  changeSpeed(speed: number = 1) {
    this.gameEngine.changeSpeed(speed);
  }
}
