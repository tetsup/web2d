import type { ClockState, Phase } from '@/types/engine';

class InvalidOperationError extends Error {}

export class GameClock {
  state: ClockState;
  constructor() {
    this.state = { phase: 'off', speed: 1.0 };
  }
  setPhase(phase: Phase) {
    switch (phase) {
      case 'off':
        throw new InvalidOperationError();
      case 'loading':
        if (this.state.phase !== 'off' && this.state.phase !== 'error') throw new InvalidOperationError();
        this.state.phase = phase;
        break;
      case 'ready':
        if (this.state.phase !== 'loading') throw new InvalidOperationError();
        this.state = { ...this.state, phase, time: 0 };
        break;
      case 'running':
        if (this.state.phase !== 'ready' && this.state.phase !== 'pause') throw new InvalidOperationError();
        this.state = { ...this.state, phase, lastTick: performance.now() };
        break;
      case 'pause':
        if (this.state.phase !== 'running' && this.state.phase !== 'pause') throw new InvalidOperationError();
        this.state.phase = phase;
        break;
      case 'error':
        this.state = { ...this.state, phase };
    }
  }

  advance(delta: number) {
    if (this.state.phase !== 'ready' && this.state.phase !== 'running' && this.state.phase !== 'pause')
      throw new InvalidOperationError();
    if (delta < 0) throw new InvalidOperationError();
    this.state.time += delta;
  }

  tick() {
    if (this.state.phase !== 'running') throw new InvalidOperationError();
    const now = performance.now();
    const delta = (now - this.state.lastTick) * this.state.speed;
    this.state = { ...this.state, time: this.state.time + delta, lastTick: now };
  }

  changeSpeed(speed: number) {
    if (speed <= 0) throw new InvalidOperationError();
    this.state.speed = speed;
  }
}
