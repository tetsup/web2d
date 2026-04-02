import type { InputManagerLike, Key } from '@/types/input';

export class InputManager<K extends Key> implements InputManagerLike<K> {
  private current = new Map<K, boolean>();

  press(key: K) {
    this.current.set(key, true);
    console.log('press');
  }

  release(key: K) {
    this.current.set(key, false);
  }

  isPressed(key: K): boolean {
    return this.current.get(key) ?? false;
  }
}
