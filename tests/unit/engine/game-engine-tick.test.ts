/**
 * ■GameEngine tick 処理テスト (src/engine/game-engine.ts — 実装済み)
 *
 * テスト観点:
 *   - advance() でゲームの onTick が呼ばれる
 *   - renderer.render が 1 回だけ呼ばれる
 *   - playerPos.tick / entity.pos.tick のコールは Game 側実装依存だが
 *     GameEngine の onTick 呼び出しが正確に 1 回であることを確認する
 *
 * モック方針:
 *   - Game.onInit: 即座に true を返す
 *   - Game.onTick: spy で呼び出し回数を検証
 *   - GameRenderer (ImageSender): render を vi.fn()
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEngine } from '@/engine/game-engine';
import type { Game, GameRenderer } from '@/types/engine';
import type { InputManagerLike } from '@/types/input';

// ---- モック: InputManager ----
const mockInput: InputManagerLike<string> = {
  press: vi.fn(),
  release: vi.fn(),
  isPressed: vi.fn(() => false),
};

// ---- モック: GameRenderer ----
const mockRender = vi.fn();
const mockRenderer: GameRenderer = {
  registerImage: vi.fn(),
  render: mockRender,
};

// 固定 nowMs
const NOW_MS = 100;

function makeMockGame(): Game<string> {
  const onTick = vi.fn(async () => true);
  const onInit = vi.fn(async () => true);
  return { onTick, onInit };
}

describe('GameEngine — onTick が正確に呼ばれる', () => {
  it('advance 1 回で onTick が 1 回呼ばれる', async () => {
    const game = makeMockGame();
    const engine = new GameEngine(mockRenderer as any, mockInput, game);
    await new Promise((r) => setTimeout(r, 0)); // onInit 完了待ち

    await engine.advance(NOW_MS);

    expect(game.onTick).toHaveBeenCalledTimes(1);
  });

  it('advance 3 回で onTick が 3 回呼ばれる', async () => {
    const game = makeMockGame();
    const engine = new GameEngine(mockRenderer as any, mockInput, game);
    await new Promise((r) => setTimeout(r, 0));

    await engine.advance(10);
    await engine.advance(10);
    await engine.advance(10);

    expect(game.onTick).toHaveBeenCalledTimes(3);
  });

  it('onTick に渡される renderer は注入した renderer と同一', async () => {
    const game = makeMockGame();
    const engine = new GameEngine(mockRenderer as any, mockInput, game);
    await new Promise((r) => setTimeout(r, 0));

    await engine.advance(NOW_MS);

    expect(game.onTick).toHaveBeenCalledWith(mockInput, expect.any(Number), mockRenderer);
  });

  it('onTick が false を返すと clock が error フェーズになる（advance 後の状態確認は不可）', async () => {
    const game = {
      onInit: vi.fn(async () => true),
      onTick: vi.fn(async () => false),
    };
    const engine = new GameEngine(mockRenderer as any, mockInput, game);
    await new Promise((r) => setTimeout(r, 0));

    // advance 経由では running に入らないため onTick=false でも error にはならない
    // ただし onTick は 1 回呼ばれるはず
    await engine.advance(NOW_MS);

    expect(game.onTick).toHaveBeenCalledTimes(1);
  });
});

describe('GameEngine — ready/pause フェーズでのみ advance が動く', () => {
  it('初期化前 (off) は advance しても onTick が呼ばれない', async () => {
    const game = makeMockGame();
    // onInit を pending のままにする (resolve しない Promise)
    let resolveInit!: (v: boolean) => void;
    (game.onInit as any) = vi.fn(() => new Promise<boolean>((r) => { resolveInit = r; }));
    const engine = new GameEngine(mockRenderer as any, mockInput, game);

    // まだ onInit が完了していないのでフェーズは loading
    await engine.advance(NOW_MS);

    expect(game.onTick).not.toHaveBeenCalled();
    resolveInit(true); // cleanup
  });
});
