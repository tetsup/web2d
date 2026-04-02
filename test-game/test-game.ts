import type { Game, GameRenderer } from '@/types/engine';
import type { InputManagerLike } from '@/types/input';
import type { Direction, State, TestKey } from './types/game';
import { createTestImage } from './test-image';

const FIELD_WIDTH = 20;
const FIELD_HEIGHT = 15;
const BLOCK_SIZE = 16;

export class TestGame implements Game<TestKey> {
  private state: State;
  constructor() {
    this.state = { x: 0, y: 0, keyState: { left: false, right: false, up: false, down: false }, skin: true };
  }

  async onInit(renderer: GameRenderer) {
    renderer.registerImage({ imageId: 'rect.for.test1', imageData: await createTestImage(BLOCK_SIZE, BLOCK_SIZE, 0) });
    renderer.registerImage({ imageId: 'rect.for.test2', imageData: await createTestImage(BLOCK_SIZE, BLOCK_SIZE, 1) });
    return true;
  }

  private move(direction: Direction, boost: boolean) {
    switch (direction) {
      case 'left':
        this.state.x = (FIELD_WIDTH + this.state.x - (boost ? 2 : 1)) % FIELD_WIDTH;
        break;
      case 'right':
        this.state.x = (FIELD_WIDTH + this.state.x + (boost ? 2 : 1)) % FIELD_WIDTH;
        break;
      case 'up':
        this.state.y = (FIELD_HEIGHT + this.state.y - (boost ? 2 : 1)) % FIELD_HEIGHT;
        break;
      case 'down':
        this.state.y = (FIELD_HEIGHT + this.state.y + (boost ? 2 : 1)) % FIELD_HEIGHT;
    }
  }

  async onTick(input: InputManagerLike<TestKey>, clock: number, renderer: GameRenderer) {
    const left = input.isPressed('left');
    const right = input.isPressed('right');
    const up = input.isPressed('up');
    const down = input.isPressed('down');
    const boost = input.isPressed('boost');

    if (left && !this.state.keyState.left) this.move('left', boost);
    if (right && !this.state.keyState.right) this.move('right', boost);
    if (up && !this.state.keyState.up) this.move('up', boost);
    if (down && !this.state.keyState.down) this.move('down', boost);
    this.state.keyState = { left, right, up, down };

    this.state.skin = (clock / 1000) % 2 == 1;

    (globalThis as any).__debug = {
      pos: {
        x: this.state.x,
        y: this.state.y,
      },
      skin: this.state.skin,
    };
    const imageId = this.state.skin ? 'rect.for.test1' : 'rect.for.test2';
    renderer.render([{ pos: { x: this.state.x * BLOCK_SIZE, y: this.state.y * BLOCK_SIZE }, imageId }]);

    return true;
  }
}
