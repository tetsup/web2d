import type { Point2d } from './common';

export type RectSize = { width: number; height: number };

export type RelativeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageObject = {
  pos: Point2d;
  imageId: string;
};

export type ImageBufferData = {
  pos: Point2d;
  imageIndex: number;
};

export type ImageWithId = {
  imageId: string;
  imageData: ImageBitmap;
};

/** Unified render data item passed to RenderEngine.render() */
export type RenderItem = {
  pos: Point2d;
  image: ImageBitmap | undefined;
};
