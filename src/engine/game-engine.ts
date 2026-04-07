import type { Game, GameRenderer } from '@/types/engine';
import type { ImageSender } from '@/image/image-sender';
import type { InputManagerLike } from '@/types/input';
import { GameClock } from './game-clock';

export class GameEngine<InputKeys extends string> {
  private clock: GameClock;
  private currentAnimationFrame?: number;

  constructor(
    private imageSender: ImageSender,
    private input: InputManagerLike<InputKeys>,
    private game: Game<InputKeys>
  ) {
    this.clock = new GameClock();
    this.init(this.game.onInit);
  }

  private async init(onInit: (imageSender: GameRenderer) => PromiseLike<boolean>) {
    if (this.clock.state.phase !== 'off' && this.clock.state.phase !== 'error') return;
    this.clock.setPhase('loading');
    if (onInit == null) this.clock.setPhase('ready');
    else {
      const initResult = await onInit(this.imageSender);
      this.clock.setPhase(initResult ? 'ready' : 'error');
    }
  }

  private async tick(time: number) {
    if (await this.game.onTick(this.input, time, this.imageSender)) {
      return true;
    } else return false;
  }

  private async loop() {
    if (this.clock.state.phase !== 'running') return;
    this.clock.tick();
    if (await this.tick(this.clock.state.time))
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
    if (this.clock.state.phase !== 'ready' && this.clock.state.phase != 'pause') return;
    this.clock.advance(timeAdd);
    await this.tick(this.clock.state.time);
  }
}
