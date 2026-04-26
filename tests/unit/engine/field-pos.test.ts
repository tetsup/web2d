/**
 * ■移動ロジック テスト
 *
 * テスト対象: FieldPos (src/engine/field-pos.ts ※未実装)
 *
 * モック方針:
 *   - Field: checkReachable
 *   - FieldPos: move, tick, getCurrentPixel, getDestination
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- 未実装モジュールの型定義 (テスト目的のみ) ----
// 実装が存在すれば以下の import が解決される
// @ts-expect-error モジュール未実装
import { FieldPos } from '@/engine/field-pos';
// @ts-expect-error モジュール未実装
import { Field } from '@/engine/field';

// ---- モック ----
const mockCheckReachable = vi.fn();
const mockField = {
  checkReachable: mockCheckReachable,
} as unknown as typeof Field;

// 固定 nowMs
const NOW_MS = 1000;

describe('FieldPos — 移動ロジック', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- 到達不能タイルへの移動 ----
  it('到達不能タイルには移動しない', () => {
    mockCheckReachable.mockReturnValue(false);

    const pos = new FieldPos(mockField, { x: 2, y: 2 });
    pos.move({ x: 3, y: 2 }, NOW_MS);

    // checkReachable が false を返した場合、現在位置は変わらない
    expect(pos.getDestination()).toEqual({ x: 2, y: 2 });
  });

  it('到達可能タイルには移動できる', () => {
    mockCheckReachable.mockReturnValue(true);

    const pos = new FieldPos(mockField, { x: 2, y: 2 });
    pos.move({ x: 3, y: 2 }, NOW_MS);

    expect(pos.getDestination()).toEqual({ x: 3, y: 2 });
  });

  // ---- 移動中の二重移動禁止 ----
  it('移動中に次の移動が発火しない', () => {
    mockCheckReachable.mockReturnValue(true);

    const pos = new FieldPos(mockField, { x: 0, y: 0 });
    pos.move({ x: 1, y: 0 }, NOW_MS);

    // まだ移動アニメーション完了前に再度 move を呼ぶ
    pos.move({ x: 2, y: 0 }, NOW_MS + 8); // 8ms 後 (アニメーション未完了想定)

    // 二番目の move は無視され、目的地は最初の move の値のまま
    expect(pos.getDestination()).toEqual({ x: 1, y: 0 });
  });

  // ---- tick の動作 ----
  it('tick によってピクセル位置が更新される', () => {
    mockCheckReachable.mockReturnValue(true);

    const pos = new FieldPos(mockField, { x: 0, y: 0 });
    const pixelBefore = pos.getCurrentPixel();

    pos.move({ x: 1, y: 0 }, NOW_MS);
    pos.tick(NOW_MS + 100);

    const pixelAfter = pos.getCurrentPixel();
    // アニメーション中なので x ピクセルが増加している
    expect(pixelAfter.x).toBeGreaterThan(pixelBefore.x);
  });

  it('tick 完了後は目的地ピクセルと一致する', () => {
    mockCheckReachable.mockReturnValue(true);

    const TILE_SIZE = 16;
    const pos = new FieldPos(mockField, { x: 0, y: 0 });
    pos.move({ x: 1, y: 0 }, NOW_MS);
    // 十分な時間が経過したとき
    pos.tick(NOW_MS + 100_000);

    expect(pos.getCurrentPixel()).toEqual({ x: 1 * TILE_SIZE, y: 0 * TILE_SIZE });
  });
});
