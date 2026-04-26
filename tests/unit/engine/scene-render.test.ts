/**
 * ■描画 テスト
 *
 * テスト対象:
 *   - retrieveLayers (src/engine/retrieve-layers.ts ※未実装)
 *   - Viewport        (src/engine/viewport.ts ※未実装)
 *
 * モック方針:
 *   - Field: resolveLayers
 *   - Player: skin.resolveLayers
 *   - EntityInstance: resolveLayers
 *   - Viewport: 実装依存のため境界値のみ確認
 *
 * 実装を使用: Rect, calcDest, samePos
 *   (これらも未実装のため import は @ts-expect-error で抑制)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// @ts-expect-error モジュール未実装
import { retrieveLayers } from '@/engine/retrieve-layers';
// @ts-expect-error モジュール未実装
import { Viewport } from '@/engine/viewport';
// @ts-expect-error モジュール未実装
import type { RenderLayer } from '@/engine/retrieve-layers';

// ---- 型定義ヘルパー ----
type Layer = { imageId: string; pos: { x: number; y: number }; visible?: boolean };

// ---- モック: Field ----
const mockFieldResolveLayers = vi.fn<[], Layer[]>(() => []);
const mockField = {
  resolveLayers: mockFieldResolveLayers,
};

// ---- モック: Player ----
const mockPlayerResolveLayers = vi.fn<[], Layer[]>(() => []);
const mockPlayer = {
  pos: { getCurrentPixel: vi.fn(() => ({ x: 16, y: 16 })) },
  resolveLayers: mockPlayerResolveLayers,
};

// ---- モック: EntityInstance ----
function makeEntity(pos: { x: number; y: number }, layers: Layer[], visible = true) {
  return {
    pos: { getCurrentPixel: vi.fn(() => pos) },
    resolveLayers: vi.fn(() => layers),
    visible,
  };
}

// 固定 nowMs
const NOW_MS = 3000;

describe('retrieveLayers — 描画レイヤー統合', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('viewport 外のエンティティは除外される', () => {
    const viewport = { x: 0, y: 0, width: 160, height: 120 };

    // viewport (0,0)-(160,120) の外にいるエンティティ
    const outsideEntity = makeEntity({ x: 200, y: 200 }, [
      { imageId: 'enemy-skin', pos: { x: 200, y: 200 } },
    ]);
    const insideEntity = makeEntity({ x: 32, y: 32 }, [
      { imageId: 'npc-skin', pos: { x: 32, y: 32 } },
    ]);

    const layers = retrieveLayers({
      field: mockField,
      player: mockPlayer,
      entities: [outsideEntity, insideEntity],
      viewport,
      nowMs: NOW_MS,
    });

    const ids = (layers as Layer[]).map((l) => l.imageId);
    expect(ids).not.toContain('enemy-skin');
    expect(ids).toContain('npc-skin');
  });

  it('visible=false のエンティティは除外される', () => {
    const viewport = { x: 0, y: 0, width: 320, height: 240 };

    const hiddenEntity = makeEntity({ x: 32, y: 32 }, [{ imageId: 'hidden-skin', pos: { x: 32, y: 32 } }], false);
    const visibleEntity = makeEntity({ x: 64, y: 64 }, [{ imageId: 'visible-skin', pos: { x: 64, y: 64 } }], true);

    const layers = retrieveLayers({
      field: mockField,
      player: mockPlayer,
      entities: [hiddenEntity, visibleEntity],
      viewport,
      nowMs: NOW_MS,
    });

    const ids = (layers as Layer[]).map((l) => l.imageId);
    expect(ids).not.toContain('hidden-skin');
    expect(ids).toContain('visible-skin');
  });

  it('field, player, entity のレイヤーが全て統合される', () => {
    const viewport = { x: 0, y: 0, width: 320, height: 240 };

    mockFieldResolveLayers.mockReturnValue([{ imageId: 'tile-bg', pos: { x: 0, y: 0 } }]);
    mockPlayerResolveLayers.mockReturnValue([{ imageId: 'player-skin', pos: { x: 16, y: 16 } }]);
    const entity = makeEntity({ x: 32, y: 32 }, [{ imageId: 'npc-skin', pos: { x: 32, y: 32 } }]);

    const layers = retrieveLayers({
      field: mockField,
      player: mockPlayer,
      entities: [entity],
      viewport,
      nowMs: NOW_MS,
    });

    const ids = (layers as Layer[]).map((l) => l.imageId);
    expect(ids).toContain('tile-bg');
    expect(ids).toContain('player-skin');
    expect(ids).toContain('npc-skin');
  });
});

describe('Viewport — プレイヤー中心・スクリーンサイズ反映', () => {
  it('プレイヤーがビューポートの中心になる', () => {
    const screenWidth = 160;
    const screenHeight = 120;
    const playerPixel = { x: 80, y: 64 };

    const vp = new Viewport({ screenWidth, screenHeight, playerPixel });

    // ビューポートの中心がプレイヤー座標と一致する
    const centerX = vp.x + vp.width / 2;
    const centerY = vp.y + vp.height / 2;
    expect(centerX).toBeCloseTo(playerPixel.x, 0);
    expect(centerY).toBeCloseTo(playerPixel.y, 0);
  });

  it('screenWidth / screenHeight がビューポートのサイズに反映される', () => {
    const screenWidth = 320;
    const screenHeight = 240;

    const vp = new Viewport({ screenWidth, screenHeight, playerPixel: { x: 160, y: 120 } });

    expect(vp.width).toBe(screenWidth);
    expect(vp.height).toBe(screenHeight);
  });

  it('プレイヤー位置が変わるとビューポートも追従する', () => {
    const screenWidth = 160;
    const screenHeight = 120;

    const vp1 = new Viewport({ screenWidth, screenHeight, playerPixel: { x: 80, y: 64 } });
    const vp2 = new Viewport({ screenWidth, screenHeight, playerPixel: { x: 160, y: 128 } });

    expect(vp2.x).toBeGreaterThan(vp1.x);
    expect(vp2.y).toBeGreaterThan(vp1.y);
  });
});
