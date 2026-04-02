import type { Key, KeyAssignment, InputManagerLike } from '@/types/input';

export class KeyboardListener<K extends Key> {
  constructor(
    private input: InputManagerLike<K>,
    private assignment: KeyAssignment<K>
  ) {}

  private onPress(e: KeyboardEvent) {
    this.input.press(this.assignment[e.key]);
  }
  private onRelease(e: KeyboardEvent) {
    this.input.release(this.assignment[e.key]);
  }

  private registerListener() {
    document.addEventListener('keydown', this.onPress);
    document.addEventListener('keyup', this.onRelease);
  }

  private unregisterListener() {
    document.removeEventListener('keydown', this.onPress);
    document.removeEventListener('keyup', this.onRelease);
  }

  start() {
    this.registerListener();
  }
  stop() {
    this.unregisterListener();
  }
}
