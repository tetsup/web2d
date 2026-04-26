/**
 * ■tick 処理 テスト
 *
 * テスト対象: Scene / GameScene (src/engine/scene.ts ※未実装)
 *
 * モック方針:
 *   - Player: skin.resolveLayers → mockPlayer.pos.tick, mockPlayer.resolveLayers
 *   - EntityInstance: resolveLayers, pos.tick
 *   - GameRenderer: render
 *   - FieldPos: tick
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// @ts-expect-error モジュール未実装
import { Scene } from '@/engine/scene';
import type { GameRenderer } from '@/types/engine';

// ---- モック: Player ----
const mockPlayerPosTick = vi.fn();
const mockPlayerResolveLayers = vi.fn(() => []);
const mockPlayer = {
  pos: {
    tick: mockPlayerPosTick,
    getDestination: vi.fn(() => ({ x: 0, y: 0 })),
    getCurrentPixel: vi.fn(() => ({ x: 0, y: 0 })),
  },
  resolveLayers: mockPlayerResolveLayers,
};

// ---- モック: EntityInstance ----
const mockEntityPosTick = vi.fn();
const mockEntityResolveLayers = vi.fn(() => []);
const mockEntity = {
  pos: {
    tick: mockEntityPosTick,
    getDestination: vi.fn(() => ({ x: 3, y: 3 })),
    getCurrentPixel: vi.fn(() => ({ x: 48, y: 48 })),
  },
  resolveLayers: mockEntityResolveLayers,
};

// ---- モック: GameRenderer ----
const mockRender = vi.fn();
const mockRenderer: GameRenderer = {
  registerImage: vi.fn(),
  render: mockRender,
};

// 固定 nowMs
const NOW_MS = 500;

describe('Scene — tick 処理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('playerPos.tick が呼ばれる', () => {
    const scene = new Scene({ player: mockPlayer, entities: [], renderer: mockRenderer });
    scene.tick(NOW_MS);

    expect(mockPlayerPosTick).toHaveBeenCalledWith(NOW_MS);
  });

  it('entity.pos.tick が呼ばれる', () => {
    const scene = new Scene({ player: mockPlayer, entities: [mockEntity], renderer: mockRenderer });
    scene.tick(NOW_MS);

    expect(mockEntityPosTick).toHaveBeenCalledWith(NOW_MS);
  });

  it('複数エンティティの pos.tick が全て呼ばれる', () => {
    const mockEntity2 = {
      pos: {
        tick: vi.fn(),
        getDestination: vi.fn(() => ({ x: 6, y: 6 })),
        getCurrentPixel: vi.fn(() => ({ x: 96, y: 96 })),
      },
      resolveLayers: vi.fn(() => []),
    };
    const scene = new Scene({
      player: mockPlayer,
      entities: [mockEntity, mockEntity2],
      renderer: mockRenderer,
    });
    scene.tick(NOW_MS);

    expect(mockEntityPosTick).toHaveBeenCalledWith(NOW_MS);
    expect(mockEntity2.pos.tick).toHaveBeenCalledWith(NOW_MS);
  });

  it('renderer.render が呼ばれる', () => {
    const scene = new Scene({ player: mockPlayer, entities: [], renderer: mockRenderer });
    scene.tick(NOW_MS);

    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it('tick ごとに renderer.render は 1 回だけ呼ばれる', () => {
    const scene = new Scene({ player: mockPlayer, entities: [mockEntity], renderer: mockRenderer });
    scene.tick(NOW_MS);
    scene.tick(NOW_MS + 16);

    expect(mockRender).toHaveBeenCalledTimes(2);
  });
});
