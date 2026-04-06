import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { GameEngine } from '@/engine/game-engine';
import { InputManager } from '@/input/input-manager';
import { TestGame } from '@test-game/test-game';
import { MockImageSender, MockWorker } from '@tests/setup/mocks';

vi.mock('@test-game/test-image');

describe('GameEngine (headless, ImageData mocked)', () => {
  let engine: GameEngine<any>;
  let worker: MockWorker;
  let sender: MockImageSender;
  let input: InputManager<any>;

  beforeEach(async () => {
    input = new InputManager();
    worker = new MockWorker();
    sender = new MockImageSender();
    const game = new TestGame();
    engine = new GameEngine(sender as any, input, game);
    await new Promise((r) => setTimeout(r, 0));
  });

  it('初期位置は(0,0)', async () => {
    await engine.advance(1);

    expect((globalThis as any).__debug.pos).toEqual({
      x: 0,
      y: 0,
    });
  });

  it('右キーで1マス移動', async () => {
    input.press('right');
    await engine.advance(1);
    input.release('right');

    expect((globalThis as any).__debug.pos).toEqual({ x: 1, y: 0 });
  });

  it('boost付き右移動で2マス', async () => {
    input.press('right');
    input.press('boost');
    await engine.advance(1);
    input.release('right');
    input.release('boost');

    expect((globalThis as any).__debug.pos).toEqual({ x: 2, y: 0 });
  });

  it('左端から左でラップ', async () => {
    input.press('left');
    await engine.advance(1);
    input.release('left');

    expect((globalThis as any).__debug.pos).toEqual({ x: 19, y: 0 });
  });

  it('押しっぱなしでも1回だけ移動', async () => {
    input.press('right');
    await engine.advance(10);
    await engine.advance(10);
    await engine.advance(10);
    input.release('right');

    expect((globalThis as any).__debug.pos).toEqual({ x: 1, y: 0 });
  });

  it('時間経過でスキン変化（簡易確認）', async () => {
    const first = (globalThis as any).__debug.skin;
    await engine.advance(1000);
    const second = (globalThis as any).__debug.skin;

    expect(first).not.toEqual(second);
  });

  it('ImageSender.render is called exactly once per tick (no double render)', async () => {
    sender.render.mockClear();
    await engine.advance(1);
    expect(sender.render).toHaveBeenCalledTimes(1);
  });

  it('ImageSender.render is called once per tick across multiple advances', async () => {
    sender.render.mockClear();
    await engine.advance(10);
    await engine.advance(10);
    await engine.advance(10);
    expect(sender.render).toHaveBeenCalledTimes(3);
  });
});
