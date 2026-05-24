import type { Phase } from '@/types/engine';
import type { StatManager } from './stat';

class ClockFunctionError extends Error {
  constructor(command: string, current: Phase, target?: Phase) {
    super(`Failed clock function command:${command} current:${current} target: ${target ?? current}`);
  }
}

export class GameClock {
  constructor(private stat: StatManager) {
    this.stat.setClock({ phase: 'off', speed: 1.0 });
  }
  setPhase(phase: Phase) {
    switch (phase) {
      case 'off':
        throw new ClockFunctionError('setPhase', this.stat.clock.phase, phase);
      case 'loading':
        if (this.stat.clock.phase !== 'off' && this.stat.clock.phase !== 'error')
          throw new ClockFunctionError('setPhase', this.stat.clock.phase, phase);
        this.stat.setClock({ ...this.stat.clock, phase });
        break;
      case 'ready':
        if (this.stat.clock.phase !== 'loading') throw new ClockFunctionError('setPhase', this.stat.clock.phase, phase);
        this.stat.setClock({ ...this.stat.clock, phase, time: 0 });
        break;
      case 'running':
        if (this.stat.clock.phase !== 'ready' && this.stat.clock.phase !== 'pause')
          throw new ClockFunctionError('setPhase', this.stat.clock.phase, phase);
        this.stat.setClock({ ...this.stat.clock, phase, lastTick: performance.now() });
        this.stat.reset();
        break;
      case 'pause':
        if (this.stat.clock.phase !== 'running' && this.stat.clock.phase !== 'pause')
          throw new ClockFunctionError('setPhase', this.stat.clock.phase, phase);
        this.stat.setClock({ ...this.stat.clock, phase });
        break;
      case 'error':
        this.stat.setClock({ ...this.stat.clock, phase });
    }
  }

  advance(delta: number) {
    if (this.stat.clock.phase !== 'ready' && this.stat.clock.phase !== 'running' && this.stat.clock.phase !== 'pause')
      throw new ClockFunctionError('advance', this.stat.clock.phase);
    if (delta < 0) throw new ClockFunctionError('advance', this.stat.clock.phase);
    this.stat.setClock({ ...this.stat.clock, time: this.stat.clock.time + delta });
  }

  tick() {
    if (this.stat.clock.phase !== 'running') throw new ClockFunctionError('tick', this.stat.clock.phase);
    const now = performance.now();
    const delta = (now - this.stat.clock.lastTick) * this.stat.clock.speed;
    this.stat.setClock({ ...this.stat.clock, time: this.stat.clock.time + delta, lastTick: now });
    this.stat.tick();
  }

  changeSpeed(speed: number) {
    if (speed <= 0) throw new ClockFunctionError('changeSpeed', this.stat.clock.phase);
    this.stat.setClock({ ...this.stat.clock, speed });
  }
}
