import { ClockState } from '@/types/engine';
import { EngineStat } from '@/types/stat';

const calcCps = (startMs: number, nowMs: number, count: number) => (count / (nowMs - startMs)) * 1000;

export class StatManager {
  private stat: EngineStat;
  private totalTickCount: number = 0;
  private totalStartMs: number;
  private intervalTickCount: number = 0;
  private intervalStartMs: number;

  constructor(
    initialStat?: EngineStat,
    private intervalMs: number = 1000
  ) {
    const anchorTime = performance.now();
    if (initialStat) this.stat = { ...initialStat };
    else
      this.stat = {
        clock: { phase: 'off', speed: 1.0 },
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
    console.log('emit');
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
    this.update({ clock });
    if (clock.phase === 'running') this.resetCount();
  };

  get clock() {
    return this.stat.clock;
  }

  private resetCount = () => {
    const nowMs = performance.now();
    this.totalTickCount = 0;
    this.totalStartMs = nowMs;
    this.intervalTickCount = 0;
    this.intervalStartMs = nowMs;
  };

  tick = () => {
    this.totalTickCount += 1;
    this.intervalTickCount += 1;
    const now = performance.now();
    if (now >= this.intervalStartMs + this.intervalMs) {
      this.updateFps(now);
    }
  };

  private updateFps = (nowMs: number) => {
    const fps = calcCps(this.totalStartMs, nowMs, this.totalTickCount);
    const intervalFps = calcCps(this.intervalStartMs, nowMs, this.intervalTickCount);
    this.update({ fps, intervalFps });
    this.intervalTickCount = 0;
    this.intervalStartMs = nowMs;
  };
}
