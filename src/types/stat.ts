import { ClockState } from './engine';

export type EngineStat = {
  clock: ClockState;
  fps?: number;
  intervalFps?: number;
  recentErrors: string[];
};
