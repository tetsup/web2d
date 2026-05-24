import { ClockState } from './engine';
import { RectSize } from './image';

export type EngineStat = {
  clock: ClockState;
  fps?: number;
  intervalFps?: number;
  reservedObjects: number;
  maxObjects?: number;
  intervalMaxObjects?: number;
  screenSize: RectSize;
  recentErrors: string[];
};
