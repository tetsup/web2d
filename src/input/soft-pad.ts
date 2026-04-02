import type { Key, SoftButtonConfig, InputManagerLike, SoftPadLike } from '@/types/input';

export class SoftPad<K extends Key> implements SoftPadLike<K> {
  private container: HTMLDivElement;

  constructor(
    parent: HTMLElement,
    private input: InputManagerLike<K>,
    width: number,
    height: number,
    buttons: SoftButtonConfig<K>[]
  ) {
    this.container = document.createElement('div');
    this.container.style.position = 'relative';
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
    this.container.style.background = '#fff';
    this.container.style.border = '1px solid #000';
    this.container.style.touchAction = 'none';
    this.createButtons(buttons);
    parent.appendChild(this.container);
  }

  createButtons(configs: SoftButtonConfig<K>[]) {
    configs.forEach((cfg) => {
      const btn = document.createElement('button');
      btn.textContent = cfg.label ?? String(cfg.key);

      btn.style.position = 'absolute';
      btn.style.left = `${cfg.rect.x}%`;
      btn.style.top = `${cfg.rect.y}%`;
      btn.style.width = `${cfg.rect.width}%`;
      btn.style.height = `${cfg.rect.height}%`;

      btn.style.border = '1px solid #000';
      btn.style.touchAction = 'none';
      btn.style.cursor = 'pointer';
      btn.style.userSelect = 'none';

      btn.style.borderRadius = cfg.shape === 'oval' ? '50%' : '12px';

      const normalBg = cfg.style?.background ?? '#333';
      const pressedBg = cfg.style?.pressedBackground ?? '#666';
      const normalColor = cfg.style?.color ?? 'white';
      const pressedColor = cfg.style?.pressedColor ?? 'white';

      btn.style.background = normalBg;
      btn.style.color = normalColor;

      const press = () => {
        btn.style.background = pressedBg;
        btn.style.color = pressedColor;
        this.input.press(cfg.key);
      };

      const release = () => {
        btn.style.background = normalBg;
        btn.style.color = normalColor;
        this.input.release(cfg.key);
      };

      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);

      this.container.appendChild(btn);
    });
  }
}
