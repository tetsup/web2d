/**
 * ■入力処理 テスト
 *
 * テスト対象: resolveMove (src/engine/resolve-move.ts ※未実装)
 *
 * モック方針:
 *   - InputManager: isPressed
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// @ts-expect-error モジュール未実装
import { resolveMove } from '@/engine/resolve-move';
import type { InputManagerLike } from '@/types/input';

// ---- ヘルパー: isPressed のモックを持つ InputManager を生成 ----
function makeInput(pressed: Partial<Record<string, boolean>>): InputManagerLike<string> {
  return {
    press: vi.fn(),
    release: vi.fn(),
    isPressed: vi.fn((key: string) => pressed[key] ?? false),
  };
}

describe('resolveMove — 方向判定', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('left キーが押されていれば "left" を返す', () => {
    const input = makeInput({ left: true });
    expect(resolveMove(input)).toBe('left');
  });

  it('right キーが押されていれば "right" を返す', () => {
    const input = makeInput({ right: true });
    expect(resolveMove(input)).toBe('right');
  });

  it('up キーが押されていれば "up" を返す', () => {
    const input = makeInput({ up: true });
    expect(resolveMove(input)).toBe('up');
  });

  it('down キーが押されていれば "down" を返す', () => {
    const input = makeInput({ down: true });
    expect(resolveMove(input)).toBe('down');
  });

  it('何も押されていなければ null/undefined を返す', () => {
    const input = makeInput({});
    const result = resolveMove(input);
    expect(result == null).toBe(true);
  });

  it('複数キー押下: left > right の優先順位', () => {
    const input = makeInput({ left: true, right: true });
    expect(resolveMove(input)).toBe('left');
  });

  it('複数キー押下: left > up の優先順位', () => {
    const input = makeInput({ left: true, up: true });
    expect(resolveMove(input)).toBe('left');
  });

  it('複数キー押下: left > down の優先順位', () => {
    const input = makeInput({ left: true, down: true });
    expect(resolveMove(input)).toBe('left');
  });

  it('複数キー押下: right > up の優先順位 (left なし)', () => {
    const input = makeInput({ right: true, up: true });
    expect(resolveMove(input)).toBe('right');
  });

  it('複数キー押下: right > down の優先順位 (left なし)', () => {
    const input = makeInput({ right: true, down: true });
    expect(resolveMove(input)).toBe('right');
  });

  it('複数キー押下: up > down の優先順位 (left, right なし)', () => {
    const input = makeInput({ up: true, down: true });
    expect(resolveMove(input)).toBe('up');
  });

  it('複数キー全押し: left が最優先', () => {
    const input = makeInput({ left: true, right: true, up: true, down: true });
    expect(resolveMove(input)).toBe('left');
  });
});
