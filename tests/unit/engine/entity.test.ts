/**
 * ■エンティティ移動 テスト
 *
 * テスト対象: EntityInstance (src/engine/entity.ts ※未実装)
 *
 * モック方針:
 *   - Field: checkReachable, resolveLayers
 *   - EntityInstance: resolveLayers, state
 *   - FieldPos: move, tick, getCurrentPixel, getDestination
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// @ts-expect-error モジュール未実装
import { EntityInstance } from '@/engine/entity';
// @ts-expect-error モジュール未実装
import type { FieldPos } from '@/engine/field-pos';

// ---- モック ----
const mockMove = vi.fn();
const mockGetDestination = vi.fn();
const mockTick = vi.fn();
const mockGetCurrentPixel = vi.fn(() => ({ x: 0, y: 0 }));

const mockFieldPos = {
  move: mockMove,
  getDestination: mockGetDestination,
  tick: mockTick,
  getCurrentPixel: mockGetCurrentPixel,
} as unknown as FieldPos;

const mockResolveLayers = vi.fn(() => []);
const mockPlayerFieldPos = {
  getDestination: vi.fn(() => ({ x: 5, y: 5 })),
} as unknown as FieldPos;

// 固定 nowMs
const NOW_MS = 2000;

describe('EntityInstance — エンティティ移動', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('プレイヤーと同じ座標には移動しない', () => {
    // エンティティの移動先がプレイヤー位置と同じ場合は移動しない
    mockGetDestination.mockReturnValue({ x: 5, y: 5 }); // 移動先 = プレイヤーと同じ座標
    mockPlayerFieldPos.getDestination = vi.fn(() => ({ x: 5, y: 5 }));

    const entity = new EntityInstance(mockFieldPos, { resolveLayers: mockResolveLayers });
    entity.tryMove({ x: 5, y: 5 }, mockPlayerFieldPos, NOW_MS);

    // move は呼ばれないはず
    expect(mockMove).not.toHaveBeenCalled();
  });

  it('プレイヤーと異なる座標であれば移動できる', () => {
    mockPlayerFieldPos.getDestination = vi.fn(() => ({ x: 3, y: 3 }));

    const entity = new EntityInstance(mockFieldPos, { resolveLayers: mockResolveLayers });
    entity.tryMove({ x: 5, y: 5 }, mockPlayerFieldPos, NOW_MS);

    // プレイヤーと異なるので move が呼ばれる
    expect(mockMove).toHaveBeenCalledWith({ x: 5, y: 5 }, NOW_MS);
  });

  it('resolveLayers はエンティティ状態を反映したレイヤーを返す', () => {
    const layers = [{ imageId: 'entity-skin-1', pos: { x: 0, y: 0 } }];
    mockResolveLayers.mockReturnValue(layers);

    const entity = new EntityInstance(mockFieldPos, { resolveLayers: mockResolveLayers });
    const result = entity.resolveLayers(NOW_MS);

    expect(result).toEqual(layers);
  });

  it('state はエンティティの現在状態を保持している', () => {
    const entity = new EntityInstance(mockFieldPos, { resolveLayers: mockResolveLayers });

    // state が undefined でないこと
    expect(entity.state).toBeDefined();
  });
});
