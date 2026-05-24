import type { Game, GameRenderer } from '@/types/engine';
import type { ImageSender } from '@/image/image-sender';
import type { InputManager } from '@/input/input-manager';
import { GameClock } from './game-clock';
import { StatManager } from './stat';

export class GameEngine<InputKeys extends string> {
  private clock: GameClock;
  private currentAnimationFrame?: number;

  constructor(
    private imageSender: ImageSender,
    private input: InputManager<InputKeys>,
    private game: Game<InputKeys>,
    private stat: StatManager
  ) {
    this.clock = new GameClock(stat);
    this.init(this.game.onInit);
  }

  private async init(onInit: (imageSender: GameRenderer) => PromiseLike<boolean>) {
    let error: any = new Error('initialize failed');
    if (this.stat.clock.phase !== 'off' && this.stat.clock.phase !== 'error') {
      console.warn(`cannot initialize current phase: ${this.stat.clock.phase}`);
      return;
    }
    this.clock.setPhase('loading');
    if (onInit == null) this.clock.setPhase('ready');
    else {
      try {
        const initResult = await onInit(this.imageSender);
        if (initResult) {
          this.clock.setPhase('ready');
          return;
        }
      } catch (e) {
        error = e;
      }
      this.clock.setPhase('error');
      throw error;
    }
  }

  private async tick(time: number) {
    if (await this.game.onTick(this.input, time, this.imageSender)) {
      return true;
    } else return false;
  }

  private async loop() {
    if (this.stat.clock.phase !== 'running') return;
    this.clock.tick();
    if (await this.tick(this.stat.clock.time))
      this.currentAnimationFrame = requestAnimationFrame(async () => await this.loop());
    else this.clock.setPhase('error');
  }

  start() {
    this.clock.setPhase('running');
    this.currentAnimationFrame = requestAnimationFrame(async () => await this.loop());
  }

  pause() {
    this.clock.setPhase('pause');
    if (this.currentAnimationFrame != null) cancelAnimationFrame(this.currentAnimationFrame);
  }

  async advance(timeAdd: number) {
    if (this.stat.clock.phase !== 'ready' && this.stat.clock.phase != 'pause') return;
    this.clock.advance(timeAdd);
    await this.tick(this.stat.clock.time);
  }

  changeSpeed(speed: number = 1) {
    this.clock.changeSpeed(speed);
  }
}
