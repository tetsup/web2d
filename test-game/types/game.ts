export type State = {
  x: number;
  y: number;
  keyState: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  };
  skin: boolean;
};

export type TestKey = 'left' | 'right' | 'up' | 'down' | 'boost';

export type Direction = 'left' | 'right' | 'up' | 'down';
