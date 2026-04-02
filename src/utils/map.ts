export class BiMap<K, V> {
  private forward: Map<K, V>;
  private reverse: Map<V, K>;

  constructor() {
    this.forward = new Map();
    this.reverse = new Map();
  }

  set(key: K, value: V) {
    if (this.getByKey(key) !== undefined || this.getByValue(value) !== undefined) throw new Error('already exists');
    this.forward.set(key, value);
    this.reverse.set(value, key);
  }

  getByKey(key: K): V | undefined {
    return this.forward.get(key);
  }

  getByValue(value: V): K | undefined {
    return this.reverse.get(value);
  }
}
