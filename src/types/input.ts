import type { RelativeRect } from './image';

export type Key = string;

export type SoftButtonStyle = {
  background?: string;
  pressedBackground?: string;
  color?: string;
  pressedColor?: string;
};

export type SoftButtonConfig<K extends Key> = {
  key: K;
  rect: RelativeRect;
  label?: string;
  shape?: 'rect' | 'oval';
  style?: SoftButtonStyle;
};

export type KeyAssignment<K extends Key> = Record<string, K>;

export interface InputManagerLike<K extends Key> {
  press(key: K): void;
  release(key: K): void;
  isPressed(key: K): boolean;
}

export interface SoftPadLike<K extends Key> {
  createButtons(configs: SoftButtonConfig<K>[]): void;
}
