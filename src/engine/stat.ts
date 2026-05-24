import { ClockState, GameOptions } from '@/types/engine';
import { EngineStat } from '@/types/stat';

const calcCps = (startMs: number, nowMs: number, count: number) => (count / (nowMs - startMs)) * 1000;

export class StatManager {
  private stat: EngineStat;
  private totalTickCount: number = 0;
  private totalStartMs: number;
  private intervalTickCount: number = 0;
  private intervalStartMs: number;
  private intervalMaxObjects: number = 0;
  private maxObjects: number = 0;

  constructor(
    gameOptions: GameOptions<any>,
    initialStat?: EngineStat,
    private intervalMs: number = 1000
  ) {
    const anchorTime = performance.now();
    if (initialStat) this.stat = { ...initialStat };
    else
      this.stat = {
        clock: { phase: 'off', speed: 1.0 },
        reservedObjects: gameOptions.maxObjects,
        screenSize: gameOptions.rectSize,
        recentErrors: [],
      };
    this.totalStartMs = anchorTime;
    this.intervalStartMs = anchorTime;
  }

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit = () => {
    for (const listener of [...this.listeners]) {
      listener();
    }
  };

  private update = (values: Partial<EngineStat>) => {
    this.stat = { ...this.stat, ...values };
    this.emit();
  };

  getSnapshot = () => this.stat;

  setClock = (clock: ClockState) => {
    this.stat = { ...this.stat, clock };
  };

  get clock() {
    return this.stat.clock;
  }

  reset = () => {
    const nowMs = performance.now();
    this.totalTickCount = 0;
    this.maxObjects = 0;
    this.totalStartMs = nowMs;
    this.intervalTickCount = 0;
    this.intervalMaxObjects = 0;
    this.intervalStartMs = nowMs;
  };

  tick = () => {
    this.totalTickCount += 1;
    this.intervalTickCount += 1;
    const now = performance.now();
    if (now >= this.intervalStartMs + this.intervalMs) {
      this.updateInterval(now);
    }
  };

  setImageObjects = (objects: number) => {
    this.maxObjects = Math.max(this.maxObjects, objects);
    this.intervalMaxObjects = Math.max(this.intervalMaxObjects, objects);
  };

  private updateInterval = (nowMs: number) => {
    const fps = calcCps(this.totalStartMs, nowMs, this.totalTickCount);
    const intervalFps = calcCps(this.intervalStartMs, nowMs, this.intervalTickCount);
    this.update({ fps, intervalFps, maxObjects: this.maxObjects, intervalMaxObjects: this.intervalMaxObjects });
    this.intervalTickCount = 0;
    this.intervalMaxObjects = 0;
    this.intervalStartMs = nowMs;
  };
}
