const HEADER_LENGTH = 2;
const HEADER_BYTES = 4 * HEADER_LENGTH;
const BLOCK_COUNT = 3;
const READY_BLOCK = 0;
const READING_BLOCK = 1;
const NONE = -1;

export class FrameBuffer {
  private header: Int32Array;
  private data: Uint8Array;

  static requiredSize(dataLength: number) {
    return HEADER_BYTES + dataLength * BLOCK_COUNT;
  }

  constructor(
    sab: SharedArrayBuffer,
    private dataLength: number
  ) {
    const dataStart = HEADER_BYTES;
    this.header = new Int32Array(sab, 0, 2);
    this.data = new Uint8Array(sab, dataStart, this.dataLength * BLOCK_COUNT);

    Atomics.store(this.header, READY_BLOCK, NONE);
    Atomics.store(this.header, READING_BLOCK, NONE);
  }

  private getDataBlockStart(block: number) {
    return block * this.dataLength;
  }

  private writeBlock(block: number, data: Uint8Array) {
    const dataStart = this.getDataBlockStart(block);
    this.data.set(data, dataStart);
  }

  write(data: Uint8Array) {
    const ready = Atomics.load(this.header, READY_BLOCK);
    const reading = Atomics.load(this.header, READING_BLOCK);
    let writeBlock = NONE;
    for (let i = 0; i < BLOCK_COUNT; i++) {
      if (i !== ready && i !== reading) {
        writeBlock = i;
        break;
      }
    }
    if (writeBlock === NONE) return;
    this.writeBlock(writeBlock, data);
    Atomics.store(this.header, READY_BLOCK, writeBlock);
  }

  private readBlock(block: number): Uint8Array {
    const dataStart = this.getDataBlockStart(block);
    return this.data.slice(dataStart, dataStart + this.dataLength);
  }

  read(): Uint8Array | null {
    const block = Atomics.load(this.header, READY_BLOCK);
    if (block === NONE) return null;
    Atomics.store(this.header, READING_BLOCK, block);
    const result = this.readBlock(block);
    Atomics.store(this.header, READING_BLOCK, NONE);
    return result;
  }
}
