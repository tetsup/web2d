import './debug/log-forwarder';
import './debug/error-forwarder';
import { GameApp } from '@/engine/game-app';
import { resolveTransparentMode } from '@/utils/transparent-mode';
import { TestGame } from './test-game';
import { KeyAssignment } from '@/types/input';
import { TestKey } from './types/game';
import type { TransparentMode } from '@/types/engine';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const keyAssignment: KeyAssignment<TestKey> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Shift: 'boost',
};

function assignPad(input: any) {
  const bind = (id: string, key: string) => {
    const el = document.getElementById(id)!;
    el.onpointerdown = () => input.press(key);
    el.onpointerup = () => input.release(key);
  };

  bind('left', 'left');
  bind('right', 'right');
  bind('up', 'up');
  bind('down', 'down');
  bind('boost', 'boost');

  return {} as any;
}

const app = new GameApp(canvas, new TestGame(), {
  maxObjects: 10,
  rectSize: { width: 320, height: 240 },
  keyAssignment,
  assignPad,
});

const params = new URLSearchParams(location.search);
const modeParam = params.get('mode');
const mode: TransparentMode = modeParam === 'sab' || modeParam === 'message' ? modeParam : resolveTransparentMode();
app.setTransparentMode(mode);

(document.getElementById('start') as HTMLButtonElement).onclick = () => {
  console.log(`starting with mode ${modeParam}`);
  app.start();
};

(document.getElementById('pause') as HTMLButtonElement).onclick = () => {
  app.pause();
};

(document.getElementById('step') as HTMLButtonElement).onclick = () => {
  app.advance(1000);
};

(window as any).app = app;
