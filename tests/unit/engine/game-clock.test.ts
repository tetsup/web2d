/**
 * ■GameClock テスト (src/engine/game-clock.ts — 実装済み)
 *
 * 既存実装に対してクロック状態遷移を網羅的にテストする。
 * テスト観点: tick 処理での時刻管理、フェーズ遷移の正確性。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameClock } from '@/engine/game-clock';

describe('GameClock — フェーズ遷移', () => {
  it('初期状態は off', () => {
    const clock = new GameClock();
    expect(clock.state.phase).toBe('off');
    expect(clock.state.speed).toBe(1.0);
  });

  it('off → loading に遷移できる', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    expect(clock.state.phase).toBe('loading');
  });

  it('loading → ready に遷移できる', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    expect(clock.state.phase).toBe('ready');
  });

  it('ready に移行すると time=0 になる', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    expect((clock.state as any).time).toBe(0);
  });

  it('ready → running に遷移できる', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    clock.setPhase('running');
    expect(clock.state.phase).toBe('running');
  });

  it('running → pause に遷移できる', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    clock.setPhase('running');
    clock.setPhase('pause');
    expect(clock.state.phase).toBe('pause');
  });

  it('off → running への直接遷移はエラー', () => {
    const clock = new GameClock();
    expect(() => clock.setPhase('running')).toThrow();
  });

  it('off → off への遷移はエラー', () => {
    const clock = new GameClock();
    expect(() => clock.setPhase('off')).toThrow();
  });

  it('running → loading への遷移はエラー', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    clock.setPhase('running');
    expect(() => clock.setPhase('loading')).toThrow();
  });
});

describe('GameClock — advance', () => {
  it('ready 状態で advance すると time が増加する', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    clock.advance(100);
    expect((clock.state as any).time).toBe(100);
  });

  it('advance を複数回呼ぶと累積される', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    clock.advance(100);
    clock.advance(50);
    expect((clock.state as any).time).toBe(150);
  });

  it('負の delta で advance するとエラー', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    expect(() => clock.advance(-1)).toThrow();
  });

  it('off 状態で advance するとエラー', () => {
    const clock = new GameClock();
    expect(() => clock.advance(10)).toThrow();
  });
});

describe('GameClock — tick', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('running 状態で tick すると time が増加する', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    clock.setPhase('running');
    const timeBefore = (clock.state as any).time;

    // performance.now を 16ms 進める
    vi.advanceTimersByTime(16);
    clock.tick();

    const timeAfter = (clock.state as any).time;
    expect(timeAfter).toBeGreaterThan(timeBefore);
  });

  it('running 以外での tick はエラー', () => {
    const clock = new GameClock();
    clock.setPhase('loading');
    clock.setPhase('ready');
    expect(() => clock.tick()).toThrow();
  });
});

describe('GameClock — changeSpeed', () => {
  it('speed を 2.0 に変更できる', () => {
    const clock = new GameClock();
    clock.changeSpeed(2.0);
    expect(clock.state.speed).toBe(2.0);
  });

  it('speed <= 0 はエラー', () => {
    const clock = new GameClock();
    expect(() => clock.changeSpeed(0)).toThrow();
    expect(() => clock.changeSpeed(-1)).toThrow();
  });
});
